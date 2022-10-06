import HttpException from './http.exception';

export default class BadRequestException extends HttpException {
    constructor() {
        super(400, `Bad Request`);
    }
}
