use napi_derive::napi;
#[napi]
pub fn calculate_damage(author_atk: i32, opponent_defense: i32) -> i32 {
    let constant_damage = 3.0;
    let mut damage = (author_atk.sqrt()).powf((constant_damage.sqrt()).powf(((850.0 + author_atk) / (450.0 + 1.26 * opponent_defense)).sqrt()));
    return damage as i32;
}
// #[napi]
// pub fn add(left:i32, right: i32) -> i32 {
//     left + right
// }




#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
