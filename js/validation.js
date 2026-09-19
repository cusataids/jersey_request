import { MAX_NUMBER, MTECH_RESTRICTED_YEARS } from './config.js';

export function validateRequest(values) {
  const number = Number(values.numberRaw);

  if (!values.sport) return problem('Choose a sport.');
  if (!values.fullName || !/\p{L}/u.test(values.fullName)) return problem('Enter your full name (letters only).', 'fullName');
  if (!values.gender) return problem('Choose Male or Female.');
  if (!values.course) return problem('Choose your course.');
  if (!values.year) return problem('Choose your course year.');
  if (values.course === 'M.Tech' && MTECH_RESTRICTED_YEARS.includes(values.year)) return problem('M.Tech students can only pick 1st or 2nd year.');
  if (!values.printedName) return problem('Enter the name to print on the jersey.', 'printedName');
  if (values.numberRaw === '' || !Number.isInteger(number) || number < 0) return problem('Enter a valid jersey number.', 'jerseyNumber');
  if (number > MAX_NUMBER) return problem('Jersey number must be ' + MAX_NUMBER + ' or lower.', 'jerseyNumber');
  if (values.sport === 'Football' && !values.shorts) return problem('Choose whether you want shorts.');
  if (!values.size) return problem('Choose a jersey size.');
  return null;
}

function problem(message, fieldId) {
  return { message, fieldId };
}
