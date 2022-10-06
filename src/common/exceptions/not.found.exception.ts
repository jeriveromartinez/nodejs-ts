import HttpException from './http.exception';

export default class NotFoundException extends HttpException {
    constructor(id: string = '') {
        super(404, `${id} Not found`);
    }
}
