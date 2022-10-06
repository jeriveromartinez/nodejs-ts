import HttpException from './http.exception';

export default class DuplicateEntityException extends HttpException {
    constructor(field: string) {
        super(409, `Duplicate Entity: field ${field} in use.`);
    }
}
