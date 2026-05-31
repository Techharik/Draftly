# Draftly — AI Email Assistant

## Overview

Draftly is a real-time AI-powered email assistant that automatically:

DEMO LINK - [HERE DEMO](https://www.loom.com/share/186e20944add4e2cbfc88003d5787b7c)

1. Watches Gmail inbox activity
2. Receives Gmail push notifications
3. Processes new emails asynchronously
4. Generates AI-based draft replies
5. Pushes real-time updates to frontend clients
6. Allows users to edit drafts before approval
7. Sends approved replies back through Gmail

The system is designed using:

- Event-driven architecture
- Queue-based background processing
- Distributed workers
- Redis Pub/Sub
- Real-time WebSocket updates
- Gmail incremental synchronization
- Monorepo architecture

---

# High-Level Architecture

```txt
                    ┌─────────────────┐
                    │   Gmail Inbox   │
                    └────────┬────────┘
                             │
                             ▼
                 ┌─────────────────────┐
                 │ Gmail Watch API     │
                 └────────┬────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │ Google Pub/Sub Topic    │
              └────────┬────────────────┘
                       │
                       ▼
             ┌──────────────────────────┐
             │ Push Subscription        │
             └────────┬─────────────────┘
                      │
                      ▼
             ┌──────────────────────────┐
             │ Webhook Endpoint         │
             └────────┬─────────────────┘
                      │
                      ▼
             ┌──────────────────────────┐
             │ EMAIL_FETCH Queue        │
             └────────┬─────────────────┘
                      │
                      ▼
             ┌──────────────────────────┐
             │ Email Worker             │
             └────────┬─────────────────┘
                      │
                      ▼
             ┌──────────────────────────┐
             │ AI_DRAFT Queue           │
             └────────┬─────────────────┘
                      │
                      ▼
             ┌──────────────────────────┐
             │ AI Worker                │
             └────────┬─────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│ PostgreSQL       │   │ Redis Pub/Sub    │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│ REST API         │   │ Socket.IO Server │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
           ┌──────────────────┐
           │ Next.js Frontend │
           └──────────────────┘
```

# High-Level Architecture

```txt
Gmail Inbox
    ↓
Gmail Watch API
    ↓
Google Pub/Sub Topic
    ↓
Push Subscription
    ↓
Webhook Endpoint
    ↓
BullMQ Queue
    ↓
Email Worker
    ↓
AI Draft Queue
    ↓
AI Worker
    ↓
Database Storage
    ↓
Redis Pub/Sub
    ↓
Socket.IO Server
    ↓
Next.js Frontend
    ↓
User Approval
    ↓
Gmail Reply API
```

---

# Monorepo Structure

```txt
apps/
  api-server/
  web/

workers/
  email-worker/
  ai-worker/

packages/
  db/
  redis/
  queue/
  logger/
  types/
```

---

# Core Technologies

## Backend

- Node.js
- Express.js
- BullMQ
- Redis
- Socket.IO
- PostgreSQL
- Google Gmail API
- Google Pub/Sub

## Frontend

- Next.js
- React
- Tailwind CSS
- Socket.IO Client

## Infrastructure

- Redis Pub/Sub
- BullMQ Queues
- Google Cloud Pub/Sub
- Gmail Push Notifications
- WebSockets

---

# Complete Functional Flow

## 1. User Login

### Flow

```txt
Frontend
  → Google OAuth
  → Gmail Access Granted
  → Tokens Stored
  → Gmail Watch Registered
```

### What Happens

1. User authenticates with Google OAuth
2. Access token and refresh token are received
3. User information is stored in PostgreSQL
4. Gmail Watch API is registered
5. Gmail returns an initial `historyId`
6. Initial `last_history_id` is stored in DB

### Why `historyId` Matters

Gmail does not send full emails in webhook events.

Instead, Gmail sends:

```json
{
  "emailAddress": "user@gmail.com",
  "historyId": "925636"
}
```

The system must use Gmail History API to fetch changes AFTER the previously stored history checkpoint.

---

# Gmail Watch Architecture

## Gmail Watch

The application registers Gmail inbox watching using:

```txt
gmail.users.watch()
```

This connects Gmail → Google Pub/Sub.

### Watch Response

```json
{
  "historyId": "925636",
  "expiration": "..."
}
```

The returned `historyId` becomes the synchronization checkpoint.

---

# Google Pub/Sub Flow

## Why Pub/Sub?

Google does not directly call our worker.

Instead:

```txt
Gmail
  → Pub/Sub Topic
  → Push Subscription
  → Webhook Endpoint
```

## Components

### Topic

```txt
draftly-gmail
```

### Push Subscription

Pushes events to:

```txt
https://ngrok-url/webhooks/gmail
```

---

# Webhook Flow

## Endpoint

```txt
POST /webhooks/gmail
```

### Receives

```json
{
  "message": {
    "data": "base64encoded"
  }
}
```

### Decoded Payload

```json
{
  "emailAddress": "user@gmail.com",
  "historyId": "925700"
}
```

---

# Queue Architecture

## Queue Processing Diagram

```txt
                 ┌──────────────────────┐
                 │ Gmail Webhook Event  │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ EMAIL_FETCH Queue    │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Email Worker         │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ AI_DRAFT Queue       │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ AI Worker            │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Draft Stored         │
                 └──────────────────────┘
```

# Queue Architecture

## Why Queues?

Webhook requests must return quickly.

Heavy operations should NOT happen inside webhook handlers.

So webhook only:

```txt
Receives Event
  → Adds Queue Job
  → Returns 200
```

This prevents:

- Timeouts
- Slow webhook responses
- Gmail retry storms
- Blocking API threads

---

# BullMQ Queues

## Queue 1 — EMAIL_FETCH

### Responsibility

Processes Gmail history changes.

### Flow

```txt
Webhook
  → EMAIL_FETCH Queue
  → Email Worker
```

---

## Queue 2 — AI_DRAFT

### Responsibility

Generates AI draft replies.

### Flow

```txt
Email Worker
  → AI_DRAFT Queue
  → AI Worker
```

---

# Email Worker Architecture

## Purpose

Processes new Gmail history events.

## Worker Flow

```txt
Get Stored History ID
    ↓
Fetch Gmail History Changes
    ↓
Extract New Messages
    ↓
Fetch Full Gmail Message
    ↓
Parse Subject / Body / Sender
    ↓
Clean Email Content
    ↓
Store Email in Database
    ↓
Add AI Draft Queue Job
    ↓
Update last_history_id
```

---

# Gmail Incremental Sync Logic

## Important Concept

The webhook `historyId` is NOT used directly.

### Incorrect Flow

```txt
Incoming historyId
  → fetch AFTER latest
  → returns empty
```

### Correct Flow

```txt
Stored previous historyId
  → fetch changes AFTER previous checkpoint
  → process new emails
  → update checkpoint
```

---

# Why `messagesAdded` Was Important

Initially:

```txt
history.messages
```

caused:

- deleted messages
- stale references
- duplicate entities

Final solution:

```txt
history.messagesAdded
```

This guarantees only newly added emails are processed.

---

# Email Filtering

The worker filters unwanted emails.

## Ignored Labels

```txt
CATEGORY_PROMOTIONS
CATEGORY_SOCIAL
SENT
```

This prevents:

- newsletters
- social notifications
- self-sent replies

---

# Email Parsing

The worker extracts:

- Subject
- Sender
- Plain text body
- Thread ID
- Gmail Message ID

---

# Email Cleaning

The system removes:

- quoted replies
- previous threads
- extra whitespace
- email formatting noise

This improves:

- AI quality
- prompt cleanliness
- response accuracy

---

# AI Worker Architecture

## Purpose

Generate intelligent draft replies.

## Flow

```txt
AI Queue Job
    ↓
Construct Prompt
    ↓
Call AI Provider
    ↓
Receive Draft
    ↓
Store Draft in DB
    ↓
Publish Realtime Event
```

---

# AI Provider

The project supports:

- OpenRouter
- OpenAI-compatible APIs

The AI worker is isolated from the API server for scalability.

---

# Retry Strategy

## BullMQ Retry System

Workers automatically retry failed jobs.

### Why?

Transient failures happen frequently:

- AI provider rate limits
- Gmail API issues
- Network interruptions
- Redis temporary failures

### Retry Benefits

- Increased reliability
- Eventual consistency
- Reduced data loss

---

# Database Architecture

## Database Relationship Diagram

```txt
┌─────────────────────────┐
│ users                   │
├─────────────────────────┤
│ id                      │
│ email                   │
│ google_id               │
│ access_token            │
│ refresh_token           │
│ last_history_id         │
└─────────────────────────┘

┌─────────────────────────┐
│ emails                  │
├─────────────────────────┤
│ id                      │
│ gmail_message_id        │
│ gmail_thread_id         │
│ subject                 │
│ from                    │
│ body                    │
│ created_at              │
└──────────┬──────────────┘
           │
           │ 1 : 1
           ▼
┌─────────────────────────┐
│ drafts                  │
├─────────────────────────┤
│ id                      │
│ email_id                │
│ content                 │
│ status                  │
│ created_at              │
└─────────────────────────┘
```

# Database Architecture

## Tables

---

## users

Stores:

- Google account info
- OAuth tokens
- Gmail history checkpoint

### Important Column

```txt
last_history_id
```

This powers incremental Gmail sync.

---

## emails

Stores:

- Gmail message ID
- Gmail thread ID
- Sender
- Subject
- Cleaned body

---

## drafts

Stores:

- AI-generated draft content
- Approval status
- Email relationship

---

# Realtime Architecture

## Realtime Event Pipeline

```txt
               ┌──────────────────┐
               │ AI Worker        │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │ Redis Publish    │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │ Redis Subscriber │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │ Socket.IO Emit   │
               └────────┬─────────┘
                        │
                        ▼
               ┌──────────────────┐
               │ Frontend Update  │
               └──────────────────┘
```

# Realtime Architecture

## Why Realtime?

Without realtime:

```txt
Frontend requires refresh
```

With realtime:

```txt
Draft appears instantly
```

---

# Redis Pub/Sub Flow

## Why Redis Pub/Sub?

Workers should not directly control WebSocket servers.

Instead:

```txt
Worker
  → Redis Publish
  → API Server Subscriber
  → Socket.IO Emit
```

This keeps:

- workers isolated
- architecture scalable
- communication decoupled

---

# Realtime Flow

```txt
AI Worker
  → Redis Publish
  → Socket Server
  → WebSocket Emit
  → Frontend Auto Update
```

---

# Socket.IO Flow

## Backend

```txt
io.emit("draft-generated")
```

## Frontend

```txt
socket.on("draft-generated")
```

When a new draft is generated:

- frontend fetches latest emails
- UI updates instantly
- no manual refresh required

---

# Frontend Architecture

## Features

- Inbox view
- Original email display
- Editable AI draft
- Approve & Send flow
- Realtime updates

---

# Editable Draft System

The frontend does NOT directly send stored DB draft.

Instead:

```txt
AI Draft
  → User Edits
  → Modified Content Sent
```

This gives users full control before approval.

---

# Approve Flow

## Frontend

```txt
POST /emails/:id/approve
```

### Body

```json
{
  "content": "edited reply"
}
```

---

## Backend

The backend:

1. Finds original email
2. Uses Gmail thread ID
3. Sends reply via Gmail API
4. Keeps conversation threading intact

---

# Gmail Reply Sending

Uses:

```txt
gmail.users.messages.send()
```

Important fields:

- threadId
- encoded raw email
- subject
- content

---

# Why Thread IDs Matter

Without thread IDs:

```txt
Reply becomes new email
```

With thread IDs:

```txt
Reply stays in original Gmail conversation
```

---

# Reliability Features

## Queue Isolation

Prevents:

- API blocking
- worker crashes affecting frontend
- webhook delays

---

## Redis-Based Communication

Allows:

- distributed workers
- horizontal scaling
- decoupled services

---

## Checkpoint Synchronization

Using `last_history_id` ensures:

- no duplicate processing
- no missing emails
- accurate Gmail synchronization

---

# Final System Characteristics

## The System Is:

- Event-driven
- Realtime
- Distributed
- Queue-based
- Fault tolerant
- Scalable
- Async-first

---

# Final User Experience

## End-to-End Product Flow

```txt
┌──────────────┐
│ New Email    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Gmail Watch  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Webhook      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Email Worker │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ AI Worker    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Draft Stored │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Realtime UI  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ User Edits   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Approve      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Gmail Reply  │
└──────────────┘
```

# Final User Experience

```txt
User receives email
    ↓
Draftly instantly processes it
    ↓
AI draft appears live in UI
    ↓
User edits response
    ↓
User clicks Approve
    ↓
Reply sent through Gmail
```

---

# Future Improvements

## Possible Enhancements

### Authentication

- JWT auth
- Session handling
- Multi-user frontend

### AI Improvements

- personalized reply tone
- context memory
- conversation summarization

### Infrastructure

- Docker deployment
- Kubernetes scaling
- Redis clustering
- dedicated websocket gateway

### Product Features

- reject workflow
- archived emails
- search
- analytics dashboard
- typing indicators
- multiple inbox support

---

# Local Development Setup

## Required Software

Install the following before running the project:

### Node.js

Recommended:

```txt
Node.js >= 20
```

---

### pnpm

Install globally:

```bash
npm install -g pnpm
```

---

### PostgreSQL

Used for:

- users
- emails
- drafts

---

### Redis

Used for:

- BullMQ
- Pub/Sub
- realtime communication

---

### ngrok

Used for:

- exposing localhost webhook endpoint
- Gmail Pub/Sub push delivery

---

# Environment Variables

## API Server

Create:

```txt
apps/api-server/.env
```

Example:

```env
PORT=3000

DATABASE_URL=postgres://postgres:password@localhost:5432/draftly

REDIS_HOST=localhost
REDIS_PORT=6379

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

OPENROUTER_API_KEY=your_openrouter_key
```

---

# Google Cloud Setup

## Enable APIs

Enable:

- Gmail API
- Pub/Sub API

---

## Create OAuth Credentials

Inside Google Cloud:

```txt
APIs & Services
  → Credentials
  → OAuth Client ID
```

Authorized redirect URI:

```txt
http://localhost:3000/auth/google/callback
```

---

## Create Pub/Sub Topic

Example:

```txt
draftly-gmail
```

---

## Create Push Subscription

Push endpoint:

```txt
https://YOUR_NGROK_URL/webhooks/gmail
```

---

# Database Setup

## Create Database

```sql
CREATE DATABASE draftly;
```

---

## Run Migrations

Run schema migrations before starting services.

Ensure tables exist:

- users
- emails
- drafts

---

# Install Dependencies

From project root:

```bash
pnpm install
```

---

# Start Redis

Example:

```bash
redis-server
```

---

# Start ngrok

Expose backend:

```bash
ngrok http 3000
```

Copy generated HTTPS URL.

Update Google Pub/Sub push subscription with:

```txt
https://YOUR_NGROK_URL/webhooks/gmail
```

---

# Run Services

## Start API Server

```bash
pnpm --filter api-server dev
```

---

## Start Email Worker

```bash
pnpm --filter email-worker dev
```

---

## Start AI Worker

```bash
pnpm --filter ai-worker dev
```

---

## Start Frontend

```bash
pnpm --filter web dev
```

---

# First-Time Setup Flow

## Step 1

Start:

- PostgreSQL
- Redis
- ngrok

---

## Step 2

Run:

- API server
- workers
- frontend

---

## Step 3

Login using:

```txt
http://localhost:3000/auth/google
```

This:

- stores tokens
- registers Gmail watch
- saves initial history checkpoint

---

## Step 4

Send email from another Gmail account.

Expected flow:

```txt
Email arrives
→ webhook triggered
→ email worker processes message
→ AI draft generated
→ realtime UI update
→ approve/send reply
```

---

# Recommended Terminal Layout

## Terminal 1

```bash
pnpm --filter api-server dev
```

## Terminal 2

```bash
pnpm --filter email-worker dev
```

## Terminal 3

```bash
pnpm --filter ai-worker dev
```

## Terminal 4

```bash
pnpm --filter web dev
```

## Terminal 5

```bash
ngrok http 3000
```

---

# Common Debugging Checks

## Realtime Not Updating

Check:

- Socket.IO connection
- event names
- Redis subscriber
- `startRealtime()` initialization

---

## Gmail Webhook Not Triggering

Check:

- ngrok URL
- Pub/Sub push endpoint
- Gmail watch registration
- topic permissions

---

## History API Errors

Check:

- `last_history_id`
- Gmail checkpoint synchronization
- proper string conversion

---

## AI Worker Failures

Check:

- OpenRouter API key
- rate limits
- worker logs
- retry configuration

---

# Summary

Draftly demonstrates a production-style architecture using:

- Gmail Push Notifications
- Google Pub/Sub
- BullMQ Workers
- Redis Pub/Sub
- Realtime WebSockets
- AI Draft Generation
- Event-driven workflows
- Incremental Gmail synchronization
- Editable AI-assisted replies

The project combines:

- backend architecture
- distributed systems
- async processing
- realtime infrastructure
- AI integration
- frontend reactivity

into a complete full-stack intelligent email assistant.
