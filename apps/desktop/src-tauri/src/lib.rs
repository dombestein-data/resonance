#[cfg(target_os = "linux")]
use tauri::Manager;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            // Enable WebKitGTK's enable-encrypted-media setting
            #[cfg(target_os = "linux")]
            {
                let main_webview = _app
                    .get_webview_window("main")
                    .expect("main webview should exist");

                main_webview.with_webview(|webview| {
                    use webkit2gtk::{SettingsExt, WebViewExt};

                    if let Some(settings) = webview.inner().settings() {
                        settings.set_enable_encrypted_media(true);

                        eprintln!(
                            "WebKitGTK encrypted media enabled: {}",
                            settings.enables_encrypted_media(),
                        );
                    }
                })?;
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
