import HttpException from './http.exception';

export default class InternalServerErrorException extends HttpException {
    constructor(message?: string) {
        super(500, message ? message : `Internal Server Error`);
    }
}
