import HttpException from './http.exception';

export default class UnavailableException extends HttpException {
    constructor(message?: string) {
        super(503, message ? message : `Unavailable Service`);
    }
}
