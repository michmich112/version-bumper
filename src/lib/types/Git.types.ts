export interface CommitOptions {
    // Committer Username
    userName: string,

    // Committer email
    userEmail: string,

    // Commit Message
    message: string,

    // Github Token
    token: string,

    // Optional tag for the commit
    tag?: Tag,

    // Branch name
    branch: string,

}

export interface Tag {
    // Tag name/annotation
    name: string,

    // Tag message
    message?: string
}