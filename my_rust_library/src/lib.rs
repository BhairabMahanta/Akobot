use napi_derive::napi;
#[napi]
pub fn calculate_damage(author_atk: f64, opponent_defense: f64) -> f64 {
    let damage = (author_atk.sqrt()).powf((3.0_f64.sqrt()).powf(((850.0 + author_atk) / (450.0 + 1.26 * opponent_defense)).sqrt()));
    damage.floor()
}
#[napi]
pub fn calculate_crit_damage(author_atk: f64, author_crit_damage:f64, opponent_defense: f64) -> f64 {
    let damage = ((author_atk*(1.5_f64.powf((author_crit_damage+ 50.0_f64 )/ 100.0_f64 ))).sqrt()).powf((3.0_f64.sqrt()).powf(((850.0 + author_atk) / (450.0 + 1.26 * opponent_defense)).sqrt()));
    damage.floor()
}

#[napi]
pub fn add(left:i32, right: i32) -> i32 {
    left + right
}




#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
    #[test]
    fn test_calculate_damage() {
        let result = calculate_damage(100, 100);
        assert_eq!(result, 100);
    }
}
