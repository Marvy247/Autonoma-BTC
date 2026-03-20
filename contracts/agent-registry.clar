;; AgentForge: Agent Registry Contract
;; Registers, discovers, and manages AI agents on Stacks

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-AGENT-EXISTS (err u101))
(define-constant ERR-AGENT-NOT-FOUND (err u102))
(define-constant ERR-INVALID-STATUS (err u103))

(define-data-var agent-count uint u0)

(define-map agents
  { agent-id: uint }
  {
    owner: principal,
    name: (string-ascii 64),
    description: (string-ascii 256),
    agent-type: (string-ascii 32),  ;; "yield-optimizer" | "data-researcher" | "trader" | "custom"
    status: (string-ascii 16),      ;; "active" | "paused" | "slashed"
    vault-contract: (optional principal),
    reputation-score: uint,         ;; 0-1000
    total-earnings: uint,           ;; in microSTX
    created-at: uint,
    heartbeat: uint                 ;; last block agent was active
  }
)

(define-map agent-by-owner
  { owner: principal, index: uint }
  { agent-id: uint }
)

(define-map owner-agent-count
  { owner: principal }
  { count: uint }
)

;; Register a new agent
(define-public (register-agent
    (name (string-ascii 64))
    (description (string-ascii 256))
    (agent-type (string-ascii 32)))
  (let (
    (new-id (+ (var-get agent-count) u1))
    (owner-count (default-to u0 (get count (map-get? owner-agent-count { owner: tx-sender }))))
  )
    (map-set agents
      { agent-id: new-id }
      {
        owner: tx-sender,
        name: name,
        description: description,
        agent-type: agent-type,
        status: "active",
        vault-contract: none,
        reputation-score: u500,
        total-earnings: u0,
        created-at: block-height,
        heartbeat: block-height
      }
    )
    (map-set agent-by-owner { owner: tx-sender, index: owner-count } { agent-id: new-id })
    (map-set owner-agent-count { owner: tx-sender } { count: (+ owner-count u1) })
    (var-set agent-count new-id)
    (ok new-id)
  )
)

;; Update agent heartbeat (proves agent is alive)
(define-public (heartbeat (agent-id uint))
  (let ((agent (unwrap! (map-get? agents { agent-id: agent-id }) ERR-AGENT-NOT-FOUND)))
    (asserts! (is-eq (get owner agent) tx-sender) ERR-NOT-AUTHORIZED)
    (map-set agents { agent-id: agent-id }
      (merge agent { heartbeat: block-height })
    )
    (ok true)
  )
)

;; Pause or resume agent
(define-public (set-agent-status (agent-id uint) (new-status (string-ascii 16)))
  (let ((agent (unwrap! (map-get? agents { agent-id: agent-id }) ERR-AGENT-NOT-FOUND)))
    (asserts! (is-eq (get owner agent) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (or (is-eq new-status "active") (is-eq new-status "paused")) ERR-INVALID-STATUS)
    (map-set agents { agent-id: agent-id } (merge agent { status: new-status }))
    (ok true)
  )
)

;; Update reputation (called by slashing contract)
(define-public (update-reputation (agent-id uint) (delta int))
  (let (
    (agent (unwrap! (map-get? agents { agent-id: agent-id }) ERR-AGENT-NOT-FOUND))
    (current (get reputation-score agent))
    (new-score (if (> delta 0)
      (min u1000 (+ current (to-uint delta)))
      (if (> (to-uint (- delta)) current) u0 (- current (to-uint (- delta))))
    ))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-set agents { agent-id: agent-id } (merge agent { reputation-score: new-score }))
    (ok new-score)
  )
)

;; Read-only: get agent info
(define-read-only (get-agent (agent-id uint))
  (map-get? agents { agent-id: agent-id })
)

(define-read-only (get-agent-count) (var-get agent-count))

(define-read-only (get-owner-agents (owner principal))
  (get count (default-to { count: u0 } (map-get? owner-agent-count { owner: owner })))
)
