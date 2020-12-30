export function get_random_int(min, max)
{
    return min + Math.floor(Math.random() * (max + 1 - min)); //Максимум не включается, минимум включается
}