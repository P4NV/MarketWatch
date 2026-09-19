// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Serialize, Deserialize, Clone)]
pub struct Position {
    symbol: String,
    qty: f64,
    avg_entry: f64,
    current_price: f64,
}

#[derive(Serialize)]
pub struct PositionDetail {
    symbol: String,
    quantity: f64,
    entry_price: String,
    market_price: String,
    pnl: String,
    pnl_percent: String,
    status: String,
}

#[derive(Serialize)]
pub struct AccountSummary {
    total_equity: String,
    available_balance: String,
    total_unrealized_pnl: String,
    currency: String,
}

pub struct BrokerState {
    positions: Mutex<Vec<Position>>,
    balance: f64,
    currency: String,
}

#[tauri::command]
fn get_positions(state: State<'_, BrokerState>) -> Vec<PositionDetail> {
    let positions = state.positions.lock().unwrap();
    
    positions.iter().map(|pos| {
        let unrealized_pnl = (pos.current_price - pos.avg_entry) * pos.qty;
        let pnl_percentage = ((pos.current_price / pos.avg_entry) - 1.0) * 100.0;
        
        PositionDetail {
            symbol: pos.symbol.clone(),
            quantity: pos.qty,
            entry_price: format!("{:.4}", pos.avg_entry),
            market_price: format!("{:.4}", pos.current_price),
            pnl: format!("{:.2}", unrealized_pnl),
            pnl_percent: format!("{:.2}%", pnl_percentage),
            status: if unrealized_pnl >= 0.0 { "profit".to_string() } else { "loss".to_string() },
        }
    }).collect()
}

#[tauri::command]
fn get_summary(state: State<'_, BrokerState>) -> AccountSummary {
    let positions = state.positions.lock().unwrap();
    
    let total_pnl: f64 = positions.iter()
        .map(|pos| (pos.current_price - pos.avg_entry) * pos.qty)
        .sum();
        
    AccountSummary {
        total_equity: format!("{:.2}", state.balance + total_pnl),
        available_balance: format!("{:.2}", state.balance),
        total_unrealized_pnl: format!("{:.2}", total_pnl),
        currency: state.currency.clone(),
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(BrokerState {
            positions: Mutex::new(vec![
                Position { symbol: "AAPL".into(), qty: 10.0, avg_entry: 150.0, current_price: 175.0 },
                Position { symbol: "BTCUSDT".into(), qty: 0.5, avg_entry: 45000.0, current_price: 62000.0 },
                Position { symbol: "EURUSD".into(), qty: 10000.0, avg_entry: 1.0800, current_price: 1.0950 },
            ]),
            balance: 20000.0,
            currency: "USD".into(),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_positions, get_summary])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

