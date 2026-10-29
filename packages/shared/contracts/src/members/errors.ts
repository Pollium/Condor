import { ErrorCode, ErrorTable } from '../shared/errors';

export const MemberErrors = {
    domain: 'Member',
    causes: {
        NotFound: 404,
        LastOwner: 409,
        CannotChangeSelf: 409
    }
} as const satisfies ErrorTable;

export type MemberErrorCode = ErrorCode<typeof MemberErrors>;

export const InvitationErrors = {
    domain: 'Invitation',
    causes: {
        NotFound: 404,
        Expired: 410,
        AlreadyMember: 409
    }
} as const satisfies ErrorTable;

export type InvitationErrorCode = ErrorCode<typeof InvitationErrors>;
