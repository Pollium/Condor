export default class RawResponse{
    constructor(
        readonly body: string | Buffer,
        readonly contentType: string,
        readonly status: number = 200
    ){}
}