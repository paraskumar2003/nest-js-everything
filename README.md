# NestJS Backend with TypeORM and MySQL

This project is a NestJS backend application using TypeORM with MySQL for a coupon management system.

## Features

- Complete user management system
- OTP generation and verification
- Coupon creation and redemption functionality
- Built with TypeScript, NestJS, and TypeORM
- MySQL database with proper indexing and constraints

## Entities

1. **Users**
   - Contains user information including mobile number and active status
   - Related to coupons through one-to-many relationship

2. **OTPs**
   - Manages one-time passwords for user verification
   - Tracks verification status and timestamp

3. **Coupons**
   - Stores coupon codes with redemption status
   - Relates to users who have redeemed them

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your database settings in `.env` file
4. Run the application:
   ```
   npm run start:dev
   ```

## API Endpoints

### Users

- `POST /users` - Create a new user
- `GET /users` - List all users (filter by active status available)
- `GET /users/:id` - Get a user by ID
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user (soft delete)

### OTPs

- `POST /otps` - Generate a new OTP
- `POST /otps/verify` - Verify an OTP
- `GET /otps` - List all OTPs (filter by mobile and verification status)
- `GET /otps/:id` - Get an OTP by ID

### Coupons

- `POST /coupons` - Create a new coupon
- `POST /coupons/redeem` - Redeem a coupon
- `GET /coupons` - List all coupons (filter by active and redemption status)
- `GET /coupons/:id` - Get a coupon by ID
- `GET /coupons/code/:code` - Get a coupon by code
- `PATCH /coupons/:id` - Update a coupon
- `DELETE /coupons/:id` - Delete a coupon (soft delete)