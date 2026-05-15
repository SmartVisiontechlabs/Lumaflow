export const generateGoogleCalendarUrl = ({
    title,
    description,
    startDate,
    endDate,
}: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
}) => {
    const formatGoogleDate = (date: string) =>
        date.replace(/[-:]/g, '').split('.')[0] + 'Z';

    const url = new URL(
        'https://calendar.google.com/calendar/render'
    );

    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', title);
    url.searchParams.append('details', description);

    url.searchParams.append(
        'dates',
        `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`
    );

    return url.toString();
};

export const generateICSFile = ({
    title,
    description,
    startDate,
    endDate,
}: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
}) => {
    return `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
DTSTART:${startDate.replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.replace(/[-:]/g, '').split('.')[0]}Z
END:VEVENT
END:VCALENDAR
`;
};