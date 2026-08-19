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

// 2026-08-19T14:30:00Z    2026-08-19T14:30:00.123Z with optional m seconds '.123'    
// 2026-08-19T17:30:00+03:00  2026-08-19T09:15:00-0500 without ':' 
const ISO_DATETIME_WITH_TZ_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
                   
export function isValidISODate(str: string): boolean {
    if (typeof str !== 'string') return false;
    if (!ISO_DATETIME_WITH_TZ_REGEX.test(str)) return false;
    // to make sure the date is actually valid and exists 
    // Date.parse return number if the date is valid and NaN if not
    return !isNaN(Date.parse(str));
}

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}