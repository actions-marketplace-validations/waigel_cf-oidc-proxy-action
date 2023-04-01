export interface CloudflareTokenResponse {
    id: string;
    name: string;
    status: string;
    issued_on: string;
    modified_on: string;
    expires_on: string;
    policies: Policy[];
    condition: Condition;
    value: string;
}
export interface Policy {
    id: string;
    effect: string;
    resources: Resources;
    permission_groups: PermissionGroup[];
}
export interface Resources {
    [key: string]: string;
}
export interface PermissionGroup {
    id: string;
    name: string;
}
export interface Condition {
    'request.ip': RequestIp;
}
export interface RequestIp {
    in: string[];
    notIn: string[];
}
