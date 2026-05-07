# Firebase Security Specification - Awaken Thrive Transform NGO

## 1. Data Invariants
- **Users**: Users can only read/write their own profile. Admins can read/write all user profiles.
- **Volunteers**: Anyone can submit a volunteer application (create). Only Admins can read, update, or delete applications.
- **Donations**: Anyone can create a donation record (signed in or anonymous depending on flow, but usually public create for the webhook/form). Only Admins can read all donations.
- **Content (Events, Blog, Programs, Sponsors, Gallery)**: Publicly readable. Only Admins can create, update, or delete.
- **Contact Messages**: Anyone can create (submit form). Only Admins can read/manage.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attempt to create a user profile with a different UID.
2. **Elevated Privilege**: Attempt to set `role: "admin"` when creating/updating own profile as a regular user.
3. **Ghost Fields**: Attempt to add `isVerified: true` to a donation record.
4. **Invalid IDs**: Attempt to use `../secrets` as a document ID.
5. **Unauthorized Blog Edit**: Regular user attempting to update a `blogPost`.
6. **Data Injection**: Sending a 1MB string into a `title` field.
7. **Relational Orphan**: Creating a BlogPost without a valid `author`.
8. **Immutability Breach**: Attempting to change the `createdAt` timestamp of a donation.
9. **Private Path Leak**: Attempting to list all `contactMessages` as a non-admin.
10. **State Shortcut**: Attempting to set a `volunteer.status` to "accepted" directly as a volunteer.
11. **PII Exposure**: Attempting to read another user's `email`.
12. **Malicious Query**: Trying to list all `donations` without any filters as a regular user.

## 3. Identity Logic
- `isSignedIn()` check.
- `isAdmin()` check via a dedicated `/admins/{userId}` collection or a field in `/users/{userId}`. I will use `/users/{userId}.role == 'admin'`.
- `isOwner(userId)` check.

## 4. Validation Helpers
- `isValidId(id)`
- `isValidUser(data)`
- `isValidVolunteer(data)`
- `isValidDonation(data)`
- `isValidEvent(data)`
- `isValidBlogPost(data)`
- `isValidProgram(data)`
- `isValidSponsor(data)`
- `isValidGallery(data)`
- `isValidContactMessage(data)`
