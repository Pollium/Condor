import BaseController from '../controllers/BaseController';
import { Controller } from '../decorators/controllers/Controller';
import { Route } from '../decorators/controllers/Route';

@Controller('')
export default class HealthController extends BaseController{
    @Route('/health', { wrap: false })
    check(){
        return { status: 'ok' };
    }
}
