;; AgentForge: x402 Payment Router
;; Agent-to-Agent (A2A) and Agent-to-External micropayments

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-FUNDS (err u101))
(define-constant ERR-INVALID-PAYMENT (err u102))
(define-constant ERR-CHANNEL-NOT-FOUND (err u103))

(define-constant PLATFORM-FEE-BPS u25) ;; 0.25% platform fee

(define-data-var payment-count uint u0)
(define-data-var total-volume uint u0)

(define-map payments
  { payment-id: uint }
  {
    sender: principal,
    recipient: principal,
    amount: uint,           ;; microSTX
    currency: (string-ascii 8), ;; "STX" | "SBTC" | "USDCX"
    memo: (string-ascii 128),   ;; task description / API endpoint
    payment-type: (string-ascii 16), ;; "a2a" | "api" | "service"
    block-height: uint,
    fee-paid: uint
  }
)

;; Payment channels for recurring agent relationships
(define-map payment-channels
  { channel-id: uint }
  {
    payer: principal,
    payee: principal,
    balance: uint,
    rate-per-task: uint,
    tasks-completed: uint,
    active: bool
  }
)

(define-data-var channel-count uint u0)

;; Send x402 micropayment (A2A or external)
(define-public (send-payment
    (recipient principal)
    (amount uint)
    (currency (string-ascii 8))
    (memo (string-ascii 128))
    (payment-type (string-ascii 16)))
  (let (
    (fee (/ (* amount PLATFORM-FEE-BPS) u10000))
    (net-amount (- amount fee))
    (new-id (+ (var-get payment-count) u1))
  )
    (asserts! (> amount u0) ERR-INVALID-PAYMENT)
    ;; Transfer net to recipient, fee to contract owner
    (try! (stx-transfer? net-amount tx-sender recipient))
    (try! (stx-transfer? fee tx-sender CONTRACT-OWNER))
    (map-set payments
      { payment-id: new-id }
      {
        sender: tx-sender,
        recipient: recipient,
        amount: amount,
        currency: currency,
        memo: memo,
        payment-type: payment-type,
        block-height: block-height,
        fee-paid: fee
      }
    )
    (var-set payment-count new-id)
    (var-set total-volume (+ (var-get total-volume) amount))
    (ok new-id)
  )
)

;; Open a payment channel between two agents
(define-public (open-channel (payee principal) (initial-deposit uint) (rate-per-task uint))
  (let ((new-id (+ (var-get channel-count) u1)))
    (try! (stx-transfer? initial-deposit tx-sender (as-contract tx-sender)))
    (map-set payment-channels
      { channel-id: new-id }
      {
        payer: tx-sender,
        payee: payee,
        balance: initial-deposit,
        rate-per-task: rate-per-task,
        tasks-completed: u0,
        active: true
      }
    )
    (var-set channel-count new-id)
    (ok new-id)
  )
)

;; Execute task payment from channel
(define-public (channel-pay (channel-id uint))
  (let ((channel (unwrap! (map-get? payment-channels { channel-id: channel-id }) ERR-CHANNEL-NOT-FOUND)))
    (asserts! (get active channel) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get payer channel) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (>= (get balance channel) (get rate-per-task channel)) ERR-INSUFFICIENT-FUNDS)
    (try! (as-contract (stx-transfer? (get rate-per-task channel) tx-sender (get payee channel))))
    (map-set payment-channels { channel-id: channel-id }
      (merge channel {
        balance: (- (get balance channel) (get rate-per-task channel)),
        tasks-completed: (+ (get tasks-completed channel) u1)
      })
    )
    (ok true)
  )
)

;; Close channel and refund remaining balance
(define-public (close-channel (channel-id uint))
  (let ((channel (unwrap! (map-get? payment-channels { channel-id: channel-id }) ERR-CHANNEL-NOT-FOUND)))
    (asserts! (is-eq (get payer channel) tx-sender) ERR-NOT-AUTHORIZED)
    (let ((remaining (get balance channel)))
      (try! (as-contract (stx-transfer? remaining tx-sender (get payer channel))))
      (map-set payment-channels { channel-id: channel-id } (merge channel { balance: u0, active: false }))
      (ok remaining)
    )
  )
)

;; Read-only
(define-read-only (get-payment (payment-id uint))
  (map-get? payments { payment-id: payment-id })
)

(define-read-only (get-channel (channel-id uint))
  (map-get? payment-channels { channel-id: channel-id })
)

(define-read-only (get-stats)
  { total-payments: (var-get payment-count), total-volume: (var-get total-volume) }
)
