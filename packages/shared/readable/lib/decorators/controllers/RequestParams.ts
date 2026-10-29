import { BodyValidator, PaginationOptions } from '../../contracts/params';
import { UploadedFile as UploadedFilePayload } from '../../contracts/upload';
import { RequestError } from '../../errors/Request';
import { parseBody } from '../../utils/controllers/parse-body';
import { parseId } from '../../utils/controllers/parse-id';
import { parseOrdinal } from '../../utils/controllers/parse-ordinal';
import { parsePagination } from '../../utils/controllers/parse-pagination';
import { createParamDecorator } from './Params';

export { Req, Reply } from './Params';

export const Body = <T>(validate?: BodyValidator<T>): ParameterDecorator =>
    createParamDecorator((req) => validate ? parseBody(validate, req.body) : req.body);

export const IdParam = (name: string): ParameterDecorator =>
    createParamDecorator((req) => parseId((req.params as Record<string, string>)[name]));

export const OrdinalParam = (name: string): ParameterDecorator =>
    createParamDecorator((req) => parseOrdinal((req.params as Record<string, string>)[name]));

export const Param = (name: string): ParameterDecorator =>
    createParamDecorator((req) => (req.params as Record<string, string>)[name]);

export const Query = (name?: string): ParameterDecorator =>
    createParamDecorator((req) =>
        name === undefined ? req.query : (req.query as Record<string, string>)[name]);

export const IdQuery = (name: string): ParameterDecorator =>
    createParamDecorator((req) => parseId((req.query as Record<string, string>)[name]));

export const OptionalIdQuery = (name: string): ParameterDecorator =>
    createParamDecorator((req) => {
        const raw = (req.query as Record<string, string | undefined>)[name];
        return raw === undefined ? undefined : parseId(raw);
    });

export const Pagination = (options?: PaginationOptions): ParameterDecorator =>
    createParamDecorator((req) => parsePagination(req.query, options));

interface MultipartRequest{
    file: () => Promise<{ filename: string; toBuffer: () => Promise<Buffer> } | undefined>;
}

export const UploadedFile = (): ParameterDecorator =>
    createParamDecorator(async (req): Promise<UploadedFilePayload> => {
        const part = await (req as typeof req & MultipartRequest).file();
        if(!part) throw RequestError.FileMissing();

        try{
            const buffer = await part.toBuffer();
            return {
                filename: part.filename,
                buffer
            };
        }catch(error){
            if(error instanceof Error && (error as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE'){
                throw RequestError.FileTooLarge();
            }
            throw error;
        }
    });
