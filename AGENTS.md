# AGENTS.md

# PROJECT OVERVIEW

Project Name:
DigiProof

Full Title:
DigiProof: Digital Asset Ownership Protection and Verification System Using AES-256 and LSB Steganography

Project Type:
Cryptography and Steganography Web Application

Academic Purpose:
Final Project for Cryptography Course

Primary Goal:
Protect digital asset ownership metadata using AES-256 encryption and LSB steganography while providing interactive visualization of cryptographic and steganographic processes.

---

# CORE PROBLEM

Digital assets such as:

* Logos
* UI/UX Designs
* Photographs
* Illustrations
* Certificates
* Posters
* Digital Documents

can easily be copied, redistributed, or claimed by unauthorized parties.

Creators often struggle to prove ownership of their digital works.

The system must provide:

1. Ownership protection.
2. Ownership verification.
3. Metadata concealment.
4. Educational visualization.

---

# SYSTEM OBJECTIVES

1. Encrypt ownership metadata using AES-256.
2. Hide encrypted metadata using LSB steganography.
3. Verify ownership from protected assets.
4. Visualize AES encryption processes.
5. Visualize LSB embedding processes.
6. Demonstrate practical application of cryptography and steganography.

---

# TECH STACK

Frontend:

* React.js
* TypeScript
* Vite
* Tailwind CSS
* Shadcn UI
* Framer Motion

Backend:

* Supabase

Database:

* PostgreSQL (Supabase)

Storage:

* Supabase Storage

Authentication:

* Supabase Auth

State Management:

* Zustand

Charts:

* Recharts

Encryption:

* AES-256 (CryptoJS)

Steganography:

* LSB Image Steganography

PDF:

* React PDF

---

# USER ROLES

## Admin

Permissions:

* Manage users
* View analytics
* Manage assets
* View verification history

## Creator

Permissions:

* Upload assets
* Protect assets
* View ownership reports
* Manage portfolio

## Verifier

Permissions:

* Upload suspicious assets
* Verify ownership
* Generate verification reports

---

# MODULES

==================================================
MODULE 1
AUTHENTICATION
==============

Features:

* Register
* Login
* Logout
* Forgot Password
* Email Verification
* User Profile

Tables:

users

---

==================================================
MODULE 2
DASHBOARD
=========

Statistics:

* Total Assets
* Protected Assets
* Ownership Verifications
* Verification Success Rate

Charts:

* Monthly Uploads
* Verification Activities
* Protection Statistics

---

==================================================
MODULE 3
ASSET MANAGEMENT
================

Asset Categories:

* Logo
* Photo
* UI Design
* Illustration
* Certificate
* Poster
* Document

Features:

* Upload Asset
* Edit Asset
* Delete Asset
* View Asset
* Download Asset

Asset Metadata:

* Asset Name
* Description
* Owner Name
* Asset ID
* Created At

Storage:

Supabase Storage

---

==================================================
MODULE 4
OWNERSHIP METADATA GENERATOR
============================

Generate:

{
owner_name,
asset_id,
asset_type,
timestamp,
copyright_note,
verification_hash
}

Display metadata before encryption.

---

==================================================
MODULE 5
AES ENCRYPTION CENTER
=====================

Purpose:

Encrypt ownership metadata.

Features:

* Generate AES Key
* Encrypt Metadata
* Show Ciphertext
* Encryption History

Visualization:

Metadata
↓
AES Encryption
↓
Ciphertext

Animated Process Required.

---

==================================================
MODULE 6
LSB STEGANOGRAPHY CENTER
========================

Purpose:

Hide ciphertext inside image.

Features:

* Binary Conversion
* Bit Embedding
* Stego Image Generation

Visualization:

Original Pixels

Modified Pixels

Changed Bits Highlight

Display before and after.

---

==================================================
MODULE 7
PROTECTED ASSET GENERATOR
=========================

Workflow:

Asset
+
Encrypted Metadata
↓
LSB Embedding
↓
Protected Asset

Output:

Protected Asset Image

Store:

Supabase Storage

---

==================================================
MODULE 8
OWNERSHIP VERIFICATION
======================

Workflow:

Upload Asset
↓
Extract Hidden Data
↓
AES Decrypt
↓
Ownership Validation

Display:

Owner Name
Asset ID
Timestamp
Verification Status

Status:

Verified Original

or

Not Verified

---

==================================================
MODULE 9
COPYRIGHT DISPUTE CENTER
========================

Purpose:

Verify ownership during copyright disputes.

Workflow:

Upload Asset
↓
Ownership Verification
↓
Generate Verification Result

Features:

PDF Export

---

==================================================
MODULE 10
SECURITY VISUALIZATION LAB
==========================

Submodules:

AES Visualization

LSB Visualization

Encryption Timeline

Extraction Timeline

Ownership Protection Flow

Interactive Animations Required.

---

==================================================
MODULE 11
PIXEL DIFFERENCE ANALYZER
=========================

Display:

Original Image

Protected Image

Difference Map

Modified Pixel Count

Embedding Statistics

---

==================================================
MODULE 12
ATTACK SIMULATION CENTER
========================

Scenario A:

No Protection

Scenario B:

AES Only

Scenario C:

AES + LSB

Visual Comparison Required.

---

==================================================
MODULE 13
ANALYTICS
=========

Charts:

Assets Protected

Ownership Verifications

Verification Success Rate

Monthly Trends

---

==================================================
MODULE 14
REPORT GENERATOR
================

Generate:

Ownership Certificate

Verification Report

Protection Report

Export:

PDF

---

# DATABASE DESIGN

Tables:

profiles

assets

asset_metadata

protected_assets

verification_logs

reports

analytics_events

---

# SUPABASE REQUIREMENTS

Implement:

* Row Level Security (RLS)
* Auth Policies
* Storage Policies

Use Supabase Client only.

Do not build custom backend servers.

---

# UI REQUIREMENTS

Theme:

Cybersecurity

Style:

Modern SaaS

Dark Mode

Glassmorphism

Professional Dashboard

Responsive Design

Use:

Tailwind CSS

Shadcn UI

Framer Motion

---

# IMPORTANT RULES

This project is a Cryptography Project.

Cryptography and Steganography are the primary focus.

Every encryption process must be visible.

Every steganography process must be visible.

Educational visualization is mandatory.

Avoid unnecessary marketplace, payment, shipping, checkout, and e-commerce features.

Focus on ownership protection and verification.


