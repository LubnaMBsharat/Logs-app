export function getDateSections (date:Date) : {year:string;month:string;day:string}{
        const year = String(date.getUTCFullYear());
        // in getUTCMonth() the months start from 0 that's why I added 1
        const month =String (date.getUTCMonth() + 1).padStart(2,"0");
        const day = String(date.getUTCDate()).padStart(2,"0");    
        return {
            year: year,
            month:month,
            day:day
        };
}