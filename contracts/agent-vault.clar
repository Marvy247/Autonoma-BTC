;; AgentForge: Agent Vault Contract
;; Dual sBTC/USDCx vault with yield routing and inheritance safety

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-FUNDS (err u101))
(define-constant ERR-VAULT-NOT-FOUND (err u102))
(define-constant ERR-HEARTBEAT-EXPIRED (err u103))

;; Heartbeat timeout: ~30 days in blocks (~4320 blocks/day)
(define-constant HEARTBEAT-TIMEOUT u129600)

(define-data-var vault-count uint u0)

(define-map vaults
  { vault-id: uint }
  {
    owner: principal,
    agent-id: uint,
    sbtc-balance: uint,       ;; in satoshis (1 sBTC = 100,000,000 sats)
    usdcx-balance: uint,      ;; in micro-USDCx (6 decimals)
    stx-balance: uint,        ;; in microSTX
    total-yield-earned: uint,
    yield-strategy: (string-ascii 32), ;; "bitflow-lp" | "lending" | "hold"
    last-heartbeat: uint,
    beneficiary: principal    ;; reclaim funds if heartbeat expires
  }
)

;; Create vault for an agent
(define-public (create-vault (agent-id uint) (yield-strategy (string-ascii 32)) (beneficiary principal))
  (let ((new-id (+ (var-get vault-count) u1)))
    (map-set vaults
      { vault-id: new-id }
      {
        owner: tx-sender,
        agent-id: agent-id,
        sbtc-balance: u0,
        usdcx-balance: u0,
        stx-balance: u0,
        total-yield-earned: u0,
        yield-strategy: yield-strategy,
        last-heartbeat: block-height,
        beneficiary: beneficiary
      }
    )
    (var-set vault-count new-id)
    (ok new-id)
  )
)

;; Deposit STX into vault
(define-public (deposit-stx (vault-id uint) (amount uint))
  (let ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    (asserts! (is-eq (get owner vault) tx-sender) ERR-NOT-AUTHORIZED)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set vaults { vault-id: vault-id }
      (merge vault {
        stx-balance: (+ (get stx-balance vault) amount),
        last-heartbeat: block-height
      })
    )
    (ok true)
  )
)

;; Withdraw STX from vault
(define-public (withdraw-stx (vault-id uint) (amount uint))
  (let ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    (asserts! (is-eq (get owner vault) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (>= (get stx-balance vault) amount) ERR-INSUFFICIENT-FUNDS)
    (try! (as-contract (stx-transfer? amount tx-sender (get owner vault))))
    (map-set vaults { vault-id: vault-id }
      (merge vault { stx-balance: (- (get stx-balance vault) amount) })
    )
    (ok true)
  )
)

;; Record sBTC balance update (sBTC SIP-010 integration point)
(define-public (record-sbtc-deposit (vault-id uint) (amount uint))
  (let ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    (asserts! (is-eq (get owner vault) tx-sender) ERR-NOT-AUTHORIZED)
    (map-set vaults { vault-id: vault-id }
      (merge vault { sbtc-balance: (+ (get sbtc-balance vault) amount) })
    )
    (ok true)
  )
)

;; Record yield earned (called by yield strategy integrations)
(define-public (record-yield (vault-id uint) (yield-amount uint))
  (let ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-set vaults { vault-id: vault-id }
      (merge vault {
        total-yield-earned: (+ (get total-yield-earned vault) yield-amount),
        stx-balance: (+ (get stx-balance vault) yield-amount)
      })
    )
    (ok true)
  )
)

;; Beneficiary reclaim if heartbeat expired (inheritance safety)
(define-public (reclaim-funds (vault-id uint))
  (let ((vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND)))
    (asserts! (is-eq (get beneficiary vault) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts!
      (> (- block-height (get last-heartbeat vault)) HEARTBEAT-TIMEOUT)
      ERR-HEARTBEAT-EXPIRED
    )
    (let ((balance (get stx-balance vault)))
      (try! (as-contract (stx-transfer? balance tx-sender (get beneficiary vault))))
      (map-set vaults { vault-id: vault-id } (merge vault { stx-balance: u0 }))
      (ok balance)
    )
  )
)

;; Read-only
(define-read-only (get-vault (vault-id uint))
  (map-get? vaults { vault-id: vault-id })
)

(define-read-only (get-vault-count) (var-get vault-count))
