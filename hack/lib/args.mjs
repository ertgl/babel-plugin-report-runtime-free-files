/**
 * @param {string[]} args
 * @param {string} name
 * @return {string | null}
 */
export function getArgumentValue(
  args,
  name,
)
{
  const index = args.indexOf(name);

  if (index === -1)
  {
    return null;
  }

  const value = args[index + 1];

  if (!value)
  {
    return null;
  }

  return value;
}
