export enum ReferenceType {
    None = 0,
    Reference = 1,
    ProjectReference = 2,
    PackageReference = 4
}
export namespace ReferenceType {
    export function hasFlag(value: ReferenceType, flag: ReferenceType): boolean {
        return (value & flag) === flag;
    }
}