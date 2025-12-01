# Development Guide

## Project Overview

This is the ElysiaJS backend for Warung Vision - a warehouse inventory and scan management system for small to medium retailers.

## Tech Stack

- **Runtime**: Bun
- **Framework**: ElysiaJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Auth**: JWT with Bun.password
- **Documentation**: Swagger/OpenAPI

## Architecture

### Layered Architecture
```
Controller (Routes)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Prisma Client (ORM)
    ↓
PostgreSQL (Database)
```

### Module Structure
Each module follows the same pattern:
- `controller.ts` - HTTP route handlers
- `service.ts` - Business logic
- `repository.ts` - Database operations
- `dto.ts` - Data validation schemas

## Development Workflow

### 1. Start Development Server
```bash
bun run dev
```
- Hot reload enabled
- API available at http://localhost:3000
- Swagger at http://localhost:3000/swagger

### 2. Make Code Changes
Edit files in `src/` directory. Changes auto-reload.

### 3. Update Database Schema
```bash
# Edit prisma/schema.prisma

# Create migration
bun run prisma:migrate -- --name "feature_name"

# View database
bun run prisma:studio
```

### 4. Test Changes
Use Postman collection or Swagger UI
- Import `API_COLLECTION.json` to Postman
- Or use Swagger at http://localhost:3000/swagger

## Common Development Tasks

### Adding a New Endpoint

1. **Add route to controller**
```typescript
// src/modules/example/controller.ts
export const exampleModule = new Elysia({ prefix: "/api/v1/example" })
  .use(requireAuth)
  .get("/endpoint", async ({ user }) => {
    return exampleService.getExample(user!.storeId);
  });
```

2. **Add business logic to service**
```typescript
// src/modules/example/service.ts
async getExample(storeId: string) {
  return exampleRepo.findByStore(storeId);
}
```

3. **Add repository method**
```typescript
// src/modules/example/repository.ts
async findByStore(storeId: string) {
  return prisma.example.findMany({ where: { storeId } });
}
```

4. **Add validation DTO**
```typescript
// src/modules/example/dto.ts
export const ExampleDtoSchema = z.object({
  name: z.string(),
});
```

### Adding Database Migration

1. Update `prisma/schema.prisma`
2. Run migration:
```bash
bun run prisma:migrate -- --name "add_new_field"
```
3. Prisma client auto-updates

### Handling Errors

Use `AppError` for consistent error responses:
```typescript
if (!found) {
  throw new AppError(404, "Item not found", "ITEM_NOT_FOUND");
}
```

### Validation

Use Zod schemas:
```typescript
const MyDtoSchema = z.object({
  email: z.string().email(),
  count: z.number().int().min(1),
});

// Validate in controller
const dto = validateDto(MyDtoSchema, body);
```

## Project Structure Deep Dive

### src/middleware/auth.ts
- `requireAuth` - Middleware that requires valid JWT
- `optionalAuth` - Middleware that optionally validates JWT
- Extracts user from JWT token

### src/utils/
- `prisma.ts` - Singleton Prisma client instance
- `jwt.ts` - JWT signing/verification utilities
- `errors.ts` - Error classes and response formatting

### src/modules/
Each module is self-contained:

**Auth Module**
- User registration and login
- Profile management
- JWT token generation

**Inventory Module**
- Product CRUD
- Stock management
- Stock history tracking
- Inventory statistics

**Scan Module**
- Scan event creation
- Item tracking
- Scan status management

**Insight Module**
- Daily insights
- Scan analytics
- Product performance
- Inventory trends
- User activity tracking

## Database Schema

```prisma
User - Store relationship (many-to-one)
Product - Store relationship (many-to-one)
ScanEvent - User relationship (many-to-one)
ScanItem - ScanEvent & Product relationships
StockHistory - User & Product relationships
```

## API Response Format

### Success Response
```json
{
  "id": "123",
  "name": "John",
  "email": "john@example.com"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

## Authentication

1. Register user → returns user data
2. Login → returns `access_token`
3. Use token in header: `Authorization: Bearer {token}`
4. Token contains: `sub` (userId), `email`, `role`, `storeId`

## Testing Endpoints

### Manual Testing with cURL
```bash
# Test health
curl http://localhost:3000/api/v1/health

# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test","storeId":"s1"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Protected endpoint
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Swagger UI
1. Navigate to http://localhost:3000/swagger
2. Click "Authorize" button
3. Enter token: `Bearer {access_token}`
4. Try endpoints interactively

## Debugging

### Enable Debug Logging
Add to code:
```typescript
console.log("Debug info:", data);
```

### Database Query Logging
```typescript
// In src/utils/prisma.ts
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});
```

### Check Running Processes
```bash
ps aux | grep "bun"
```

### Check Port Usage
```bash
netstat -an | grep 3000
```

## Performance Tips

1. **Use indexes** in database queries
2. **Implement pagination** for large datasets
3. **Cache frequently accessed data**
4. **Batch operations** when possible
5. **Use database views** for complex aggregations

## Deployment Considerations

### Environment Variables
- Ensure all required vars are set
- Use strong JWT_SECRET in production
- Configure DATABASE_URL for production DB

### Database
- Run migrations before deploying
- Set up proper backups
- Monitor database performance

### Server
- Use process manager (PM2, systemd)
- Configure reverse proxy (nginx, Apache)
- Enable CORS for frontend domain
- Set up monitoring and logging

## Useful Commands

```bash
# Development
bun run dev                    # Start dev server
bun run build                  # Build for production
bun run start                  # Start production

# Database
bun run prisma:generate       # Generate Prisma client
bun run prisma:migrate        # Create migration
bun run prisma:studio         # Visual DB explorer

# Code Quality
bun run format                # Format with Prettier
bun run lint                  # Run ESLint
```

## Tips & Tricks

### Hot Module Reload
- Changes to any file automatically reload
- Keep browser/Postman open for quick testing

### Database Studio
```bash
bun run prisma:studio
```
- Visual database explorer
- Edit data directly
- View relationships

### Token Debugging
- Decode JWT at jwt.io to inspect token contents
- Check expiration time
- Verify payload matches user

### Error Tracking
- Always use `AppError` for consistent responses
- Include error code for frontend to handle
- Log errors to monitoring service

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow naming conventions
- Add comments for complex logic
- Use Zod for validation

### Commit Messages
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
refactor: Code refactoring
test: Tests
```

### Before Pushing
```bash
bun run lint       # Fix linting issues
bun run format     # Format code
bun run test       # Run tests (when available)
```

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### Request Logging
Monitor console output for request details

### Error Tracking
Check error responses for debugging

## Security Considerations

1. ✅ **Password hashing** with Bun.password (bcrypt)
2. ✅ **JWT tokens** for authentication
3. ✅ **Prisma ORM** prevents SQL injection
4. ✅ **Zod validation** prevents invalid data
5. ⚠️ **TODO**: Add rate limiting
6. ⚠️ **TODO**: Add helmet for security headers
7. ⚠️ **TODO**: Add CORS whitelist

## Learning Resources

- [ElysiaJS Docs](https://elysiajs.com)
- [Prisma Docs](https://prisma.io/docs)
- [Zod Docs](https://zod.dev)
- [Bun Docs](https://bun.sh)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Getting Help

1. Check error messages in console
2. Review relevant documentation
3. Check Swagger UI for API spec
4. Use Prisma Studio for DB inspection
5. Check test examples
6. Review similar code in other modules

---

Happy coding! 🚀
