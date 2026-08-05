export class AppError extends Error{
    name : string;
    statusCode: number;
    constructor(message:string, name:string, code: number){
        super(message);
        this.name = name
        this.statusCode = code
    }   

}

export class BadRequestError extends AppError{
    constructor(message:string){
        super(message,"Bad Request",400);
    }    
}

export class UnauthorizedError extends AppError{
    constructor(message:string){
        super(message,"Unauthorized",401);
    }
}

export class ForbiddenError extends AppError{
    constructor(message:string){
        super(message,"Forbidden",403);
    }
}

export class NotFoundError extends AppError{
    constructor(message:string){
        super(message, "Not found",404);
    }
}

export class ServiceUnavailable extends AppError{
    constructor(message:string){
        super(message,"Service Unavailable",503);
    }
}

