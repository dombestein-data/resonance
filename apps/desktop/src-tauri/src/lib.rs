#[cfg(target_os = "linux")]
use tauri::Manager;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::io::{ErrorKind, Read, Write};
use std::net::TcpListener;
use std::thread;
use std::time::{Duration, Instant};
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn spotify_authorize(
    authorization_url: String,
) -> Result<String, String> {
    if !authorization_url.starts_with(
        "https://accounts.spotify.com/authorize?",
    ) {
        return Err(
            "Refusing to open an unexpected authorization URL"
                .to_string(),
        );
    }

    tauri::async_runtime::spawn_blocking(move || {
        receive_spotify_callback(authorization_url)
    })
    .await
    .map_err(|error| {
        format!("Spotify authorization task failed: {error}")
    })?
}

fn receive_spotify_callback(
    authorization_url: String,
) -> Result<String, String> {
    const CALLBACK_ADDRESS: &str = "127.0.0.1:43821";
    const CALLBACK_ORIGIN: &str = "http://127.0.0.1:43821";
    const AUTHORIZATION_TIMEOUT: Duration = 
        Duration::from_secs(300);
    
    /*
    * Bind before opening the browser so Spotify cannot
    * redirect back before Resonance begins listening.
    */
    let listener = TcpListener::bind(CALLBACK_ADDRESS)
        .map_err(|error| {
            format!(
                "Could not start Spotify callback listener on \
                {CALLBACK_ADDRESS}: {error}"
            )
        })?;

    listener
        .set_nonblocking(true)
        .map_err(|error| {
            format!(
                "Could not configure Spotify callback listener: \
                {error}"
            )
        })?;

    tauri_plugin_opener::open_url(
        authorization_url,
        None::<&str>,
    )
    .map_err(|error| {
        format!(
            "Could not open Spotify authorization page: {error}"
        )
    })?;

    let deadline = 
        Instant::now() + AUTHORIZATION_TIMEOUT;

    while Instant::now() < deadline {
        match listener.accept() {
            Ok((mut stream, _address)) => {
                let mut request_buffer = [0_u8; 8192];

                let bytes_read = stream
                    .read(&mut request_buffer)
                    .map_err(|error| {
                        format!(
                            "Could not read Spotify callback: \
                            {error}"
                        )
                    })?;

                let request = String::from_utf8_lossy(
                    &request_buffer[..bytes_read],
                );

                let request_target = parse_request_target(&request)?;

                if !request_target.starts_with("/callback?") {
                    write_browser_response(
                        &mut stream,
                        "Spotify callback not recognized.",
                        false,
                    )?;

                    continue;
                }

                write_browser_response(
                    &mut stream,
                    "Spotify connected to Resonance. \
                    You can close this browser window.",
                    true,
                )?;

                return Ok(format!(
                    "{CALLBACK_ORIGIN}{request_target}"
                ));
            }

            Err(error)
                if error.kind() == ErrorKind::WouldBlock =>
            {
                thread::sleep(Duration::from_millis(50));
            }

            Err(error) => {
                return Err(format!(
                    "Spotify callback listener failed: {error}"
                ));
            }
        }
    }

    Err(
        "Spotify authorization timed out after five minutes"
            .to_string(),
    )
}

fn parse_request_target(
    request: &str,
) -> Result<&str, String> {
    let request_line = request
        .lines()
        .next()
        .ok_or_else(|| {
            "Spotify callback contained no HTTP request line"
                .to_string()
        })?;

    let mut parts = request_line.split_whitespace();

    let method = parts.next().ok_or_else(|| {
        "Spotify callback contained no HTTP method".to_string()
    })?;

    let target = parts.next().ok_or_else(|| {
        "Spotify callback contained no request target"
            .to_string()
    })?;

    if method != "GET" {
        return Err(format!(
            "Spotify callback used unexpected method: {method}"
        ));
    }

    Ok(target)
}

fn write_browser_response(
    stream: &mut impl Write,
    message: &str,
    success: bool,
) -> Result<(), String> {
    let title = if success {
        "Spotify connected"
    } else {
        "Spotify connection failed"
    };

    let accent = if success {
        "#1ed760"
    } else {
        "#ff6b6b"
    };

    let body = format!(
        r#"<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >
  <title>{title}</title>
  <style>
    :root {{
      color-scheme: dark;
      font-family: system-ui, sans-serif;
    }}

    body {{
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      color: #f2f4f8;
      background: #0d1117;
    }}

    main {{
      width: min(32rem, calc(100% - 3rem));
      padding: 2rem;
      background: #151a22;
      border: 1px solid #2c3441;
      border-left: 0.35rem solid {accent};
      border-radius: 0.75rem;
    }}

    h1 {{
      margin-top: 0;
    }}

    p {{
      margin-bottom: 0;
      color: #9aa4b3;
      line-height: 1.5;
    }}
  </style>
</head>
<body>
  <main>
    <h1>{title}</h1>
    <p>{message}</p>
  </main>
</body>
</html>"#
    );

    let response = format!(
        "HTTP/1.1 200 OK\r\n\
         Content-Type: text/html; charset=utf-8\r\n\
         Content-Length: {}\r\n\
         Connection: close\r\n\
         Cache-Control: no-store\r\n\
         \r\n\
         {}",
        body.len(),
        body,
    );

    stream
        .write_all(response.as_bytes())
        .map_err(|error| {
            format!(
                "Could not respond to authorization browser: \
                 {error}"
            )
        })?;

    stream.flush().map_err(|error| {
        format!(
            "Could not finish authorization response: {error}"
        )
    })
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
        .invoke_handler(tauri::generate_handler![
            greet,
            spotify_authorize,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
