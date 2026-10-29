import BaseController from '../controllers/BaseController';
import { Middleware } from '../decorators/middleware/Middleware';
import { AuthenticatedRoute } from './AuthenticatedRoute';

@Middleware(AuthenticatedRoute)
export default abstract class AuthenticatedController extends BaseController{}
