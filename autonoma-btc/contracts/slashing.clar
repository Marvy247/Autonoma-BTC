;; AgentForge: Slashing Contract
;; DAO-governed stake slashing for malicious/failed agents

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-VOTED (err u101))
(define-constant ERR-PROPOSAL-NOT-FOUND (err u102))
(define-constant ERR-VOTING-CLOSED (err u103))
(define-constant ERR-QUORUM-NOT-MET (err u104))

(define-constant VOTING-PERIOD u144)   ;; ~1 day in blocks
(define-constant QUORUM-THRESHOLD u3)  ;; min votes to execute slash
(define-constant SLASH-PERCENTAGE u20) ;; slash 20% of stake

(define-data-var proposal-count uint u0)

(define-map slash-proposals
  { proposal-id: uint }
  {
    proposer: principal,
    agent-id: uint,
    reason: (string-ascii 256),
    votes-for: uint,
    votes-against: uint,
    created-at: uint,
    executed: bool
  }
)

(define-map votes
  { proposal-id: uint, voter: principal }
  { vote: bool }
)

(define-map agent-stakes
  { agent-id: uint }
  { stake: uint, owner: principal }
)

;; Stake STX as agent collateral
(define-public (stake-for-agent (agent-id uint) (amount uint))
  (let ((current (default-to { stake: u0, owner: tx-sender } (map-get? agent-stakes { agent-id: agent-id }))))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set agent-stakes { agent-id: agent-id }
      { stake: (+ (get stake current) amount), owner: tx-sender }
    )
    (ok true)
  )
)

;; Propose slashing an agent
(define-public (propose-slash (agent-id uint) (reason (string-ascii 256)))
  (let ((new-id (+ (var-get proposal-count) u1)))
    (map-set slash-proposals
      { proposal-id: new-id }
      {
        proposer: tx-sender,
        agent-id: agent-id,
        reason: reason,
        votes-for: u0,
        votes-against: u0,
        created-at: stacks-block-height,
        executed: false
      }
    )
    (var-set proposal-count new-id)
    (ok new-id)
  )
)

;; Vote on a slash proposal
(define-public (vote (proposal-id uint) (vote-for bool))
  (let ((proposal (unwrap! (map-get? slash-proposals { proposal-id: proposal-id }) ERR-PROPOSAL-NOT-FOUND)))
    (asserts! (is-none (map-get? votes { proposal-id: proposal-id, voter: tx-sender })) ERR-ALREADY-VOTED)
    (asserts! (< (- stacks-block-height (get created-at proposal)) VOTING-PERIOD) ERR-VOTING-CLOSED)
    (map-set votes { proposal-id: proposal-id, voter: tx-sender } { vote: vote-for })
    (map-set slash-proposals { proposal-id: proposal-id }
      (merge proposal {
        votes-for: (if vote-for (+ (get votes-for proposal) u1) (get votes-for proposal)),
        votes-against: (if vote-for (get votes-against proposal) (+ (get votes-against proposal) u1))
      })
    )
    (ok true)
  )
)

;; Execute slash if quorum met and voting period ended
(define-public (execute-slash (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? slash-proposals { proposal-id: proposal-id }) ERR-PROPOSAL-NOT-FOUND))
    (stake-info (default-to { stake: u0, owner: CONTRACT-OWNER }
      (map-get? agent-stakes { agent-id: (get agent-id proposal) })))
  )
    (asserts! (not (get executed proposal)) ERR-NOT-AUTHORIZED)
    (asserts! (>= (get votes-for proposal) QUORUM-THRESHOLD) ERR-QUORUM-NOT-MET)
    (asserts! (> (get votes-for proposal) (get votes-against proposal)) ERR-QUORUM-NOT-MET)
    (let ((slash-amount (/ (* (get stake stake-info) SLASH-PERCENTAGE) u100)))
      (map-set agent-stakes { agent-id: (get agent-id proposal) }
        (merge stake-info { stake: (- (get stake stake-info) slash-amount) })
      )
      (map-set slash-proposals { proposal-id: proposal-id } (merge proposal { executed: true }))
      (ok slash-amount)
    )
  )
)

;; Read-only
(define-read-only (get-proposal (proposal-id uint))
  (map-get? slash-proposals { proposal-id: proposal-id })
)

(define-read-only (get-agent-stake (agent-id uint))
  (map-get? agent-stakes { agent-id: agent-id })
)
