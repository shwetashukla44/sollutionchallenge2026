# Security Specification: LogiFlow AI

## 1. Data Invariants
- A shipment cannot be created without a unique ID and a valid pickup/delivery location.
- Only Admins and Dispatchers can create or update shipments.
- Drivers can only be updated by Admins or if the update comes from a system-level event (simulated).
- Users can only read their own profiles, but Admins can read all.
- Invoices are read-only for Viewers and only editable by Finance or Admin.
- Every write must have a valid `request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Injection**: Attempt to create a Shipment with `driverId` of another user.
2. **Role Escalation**: Authenticated user trying to update their own `role` to 'admin'.
3. **Ghost Field**: Adding `isVerified: true` to a shipment update.
4. **ID Poisoning**: Creating a shipment with a 2KB junk string as the document ID.
5. **Orphaned shipment**: Creating a shipment assigned to a non-existent vehicle.
6. **Timeline Spoofing**: Setting a 2020 `updatedAt` value.
7. **Cross-Tenant Read**: User A trying to `get` the profile of User B.
8. **Invalid Enum**: Setting shipment status to "teleporting".
9. **Negative Revenue**: Setting `revenue: -5000`.
10. **Admin Bypass**: Attempting to delete the `warehouses` collection as a Viewer.
11. **PII Scraping**: Attempting a `list` query on `users` without filters as a Viewer.
12. **Massive Payload**: Sending a 1.5MB string in the `notes` field.

## 3. Test Runner (Mock Tests)
- `test('Deny non-auth create')`
- `test('Deny non-admin role update')`
- `test('Deny invalid status enum')`
- `test('Deny cross-user read')`
- `test('Allow admin list all ships')`
