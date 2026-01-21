import { JwtPayload } from '../auth/types/jwt-payload';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
