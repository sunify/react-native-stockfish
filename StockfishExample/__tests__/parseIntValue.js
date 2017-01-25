import parseIntValue from '../../parseIntValue';

it('parseIntValue', () => {
  expect(parseIntValue(' cp 10', 'cp')).toBe(10);
  expect(parseIntValue(' cp -10', 'cp')).toBe(-10);
});
