Admin Flow
/admin/login
     │
     ├── Email/password login OR Google OAuth
     │
     └── → /admin (Admin panel, tabs)
            │
            ├── Officers tab — list all Firestore users, search by name/svc no
            ├── Enrollments tab — all course enrollments, status management
            ├── Messages tab — contact form submissions from Firestore
            └── Courses tab — CRUD courses
                  │
                  └── Logout → /login




 /signup (Portal Activation)
              │
              ├── REMOVE Step 1: Enter Service Number → verified against Google Sheets API
              ├── Step 2: Fill profile (personal info, location, department, NOK)
              └── Step 3: only Set password +  upload passport/signature
                     │
                     ├── Firebase Auth: createUserWithEmailAndPassword()
                     ├──── Service Number → generateEmail() → signInWithEmailAndPassword
                     └── Firestore: users/{uid} doc created
                            │
                            └── Redirect → /login → /dashboard
       │
 │
       ├── /login
       │     ├── Service Number → generateEmail() → signInWithEmailAndPassword
       │     └── No profile → /signup (continue setup)
       │
       └── /dashboard
             ├── Profile card (photo, rank, service number, state, department)
             ├── Enrollments list (from Firestore enrollments)
             ├── Quick actions (courses, publications, ID card, logout)
             └── Logout → session cleared → /login


The current login flow in Login.tsx:110-134 is straightforward:
handleLogin(e)
  │
  ├── 1. Take input (loginUser)
  ├── 2. If no "@" in input → generateEmail(input)
  │        (converts "CAD/01/234/XX" → "cad01234xx@cadeti.org")
  ├── 3. signInWithEmailAndPassword(auth, email, password)
  ├── 4. On success → Firebase Auth fires onAuthStateChanged
  │        in AuthContext → fetches profile from Firestore users/{uid}
  │        + admin check from admins/{uid}
  │        → After both complete → setLoading(false)
  └── 5. Login.tsx re-renders:
         if (authLoading) → spinner
         if (user) {
           if (isAdmin) → /admin
           if (profile) → /dashboard
           else → /signup
         }

