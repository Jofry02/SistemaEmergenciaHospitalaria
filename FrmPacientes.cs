using System.Net;
using System.Net.Sockets;
using System.Text;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace SistemaEmergenciaHospitalaria
{
    public partial class FrmPacientes : Form
    {
        private readonly WebView2 webView;
        private readonly BackendBridge backend;
        private readonly Label loadingLabel;
        private CancellationTokenSource? _serverCts;
        private readonly TaskCompletionSource<object?> _serverReady = new();

        public FrmPacientes()
        {
            InitializeComponent();

            Text = "Genesis Emergency System — Hospital Francisco Moscoso Puello";
            WindowState = FormWindowState.Maximized;

            var iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");
            if (!File.Exists(iconPath))
                iconPath = Path.Combine(Environment.CurrentDirectory, "icon.ico");
            if (File.Exists(iconPath))
                Icon = new Icon(iconPath);

            loadingLabel = new Label
            {
                Text = "Cargando sistema…",
                Font = new Font("Segoe UI", 18, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                BackColor = Color.FromArgb(15, 23, 42),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter,
                AutoSize = false,
            };
            Controls.Add(loadingLabel);

            backend = new BackendBridge();
            webView = new WebView2 { Dock = DockStyle.Fill, Visible = false };

            webView.CoreWebView2InitializationCompleted += async (s, e) =>
            {
                if (!e.IsSuccess)
                {
                    MostrarError("Error al inicializar WebView2: " + e.InitializationException?.Message);
                    return;
                }

                try
                {
                    await _serverReady.Task.WaitAsync(TimeSpan.FromSeconds(10));
                }
                catch
                {
                    MostrarError("El servidor HTTP no respondió a tiempo. Verifique que el puerto 9876 esté disponible.");
                    return;
                }

                webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
                webView.CoreWebView2.AddHostObjectToScript("backend", backend);
                webView.CoreWebView2.Navigate("http://localhost:9876");
            };

            webView.NavigationCompleted += (s, e) =>
            {
                if (e.IsSuccess)
                {
                    loadingLabel.Visible = false;
                    webView.Visible = true;
                }
                else
                {
                    MostrarError("Error al cargar la aplicación.");
                }
            };

            Controls.Add(webView);
            webView.EnsureCoreWebView2Async();
            IniciarServidor();
        }

        private void MostrarError(string mensaje)
        {
            BeginInvoke(() =>
            {
                loadingLabel.Text = "Error:\n" + mensaje + "\n\nCierre la aplicación e intente de nuevo.";
                loadingLabel.ForeColor = Color.FromArgb(239, 68, 68);
            });
        }

        private void IniciarServidor()
        {
            var wwwroot = BuscarRaizFrontend();
            if (wwwroot == null)
            {
                _serverReady.TrySetException(new FileNotFoundException(
                    "No se encontró Desktop/dist/index.html.\nEjecute 'npm run build' en la carpeta Desktop/"));
                MessageBox.Show("No se encontró Desktop/dist/index.html.\nEjecute 'npm run build' en la carpeta Desktop/",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            _serverCts = new CancellationTokenSource();
            var ct = _serverCts.Token;

            _ = Task.Run(async () =>
            {
                TcpListener? listener = null;
                try
                {
                    listener = new TcpListener(IPAddress.Loopback, 9876);
                    listener.Start();
                    _serverReady.TrySetResult(null);

                    while (!ct.IsCancellationRequested)
                    {
                        var client = await listener.AcceptTcpClientAsync(ct);
                        _ = AtenderCliente(client, wwwroot, ct);
                    }
                }
                catch (OperationCanceledException) { }
                catch (Exception ex)
                {
                    _serverReady.TrySetException(ex);
                    BeginInvoke(() =>
                        MessageBox.Show($"Error en el servidor HTTP: {ex.Message}",
                        "Servidor", MessageBoxButtons.OK, MessageBoxIcon.Warning));
                }
                finally
                {
                    if (listener != null)
                    {
                        try { listener.Stop(); } catch { }
                    }
                }
            }, ct);
        }

        private static async Task AtenderCliente(TcpClient client, string wwwroot, CancellationToken ct)
        {
            using (client)
            {
                try
                {
                    var stream = client.GetStream();
                    using var reader = new StreamReader(stream, Encoding.UTF8);

                    var linea = await reader.ReadLineAsync(ct) ?? "";
                    if (!linea.StartsWith("GET "))
                    {
                        await Responder(stream, 400, "Bad Request");
                        return;
                    }

                    var ruta = linea.Split(' ')[1].TrimStart('/');
                    if (string.IsNullOrEmpty(ruta)) ruta = "index.html";

                    // Evitar directory traversal
                    ruta = ruta.Replace("..", "");
                    var archivo = Path.Combine(wwwroot, ruta);

                    if (!File.Exists(archivo))
                        archivo = Path.Combine(wwwroot, "index.html"); // SPA fallback

                    var ext = Path.GetExtension(archivo);
                    var contentType = ext switch
                    {
                        ".html" => "text/html; charset=utf-8",
                        ".js" => "application/javascript",
                        ".css" => "text/css",
                        ".svg" => "image/svg+xml",
                        ".png" => "image/png",
                        ".ico" => "image/x-icon",
                        ".json" => "application/json",
                        _ => "application/octet-stream"
                    };

                    var contenido = await File.ReadAllBytesAsync(archivo, ct);
                    var header = $"HTTP/1.1 200 OK\r\nContent-Type: {contentType}\r\nContent-Length: {contenido.Length}\r\nCache-Control: no-cache\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n";
                    await stream.WriteAsync(Encoding.UTF8.GetBytes(header), ct);
                    await stream.WriteAsync(contenido, ct);
                }
                catch { /* cliente desconectado */ }
            }
        }

        private static async Task Responder(NetworkStream stream, int code, string msg)
        {
            var body = Encoding.UTF8.GetBytes(msg);
            var header = $"HTTP/1.1 {code} {msg}\r\nContent-Length: {body.Length}\r\nConnection: close\r\n\r\n";
            await stream.WriteAsync(Encoding.UTF8.GetBytes(header));
            await stream.WriteAsync(body);
        }

        private static string? BuscarRaizFrontend()
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var curDir = Environment.CurrentDirectory;

            var candidatas = new List<string>
            {
                Path.Combine(curDir, "Desktop", "dist"),
                Path.Combine(curDir, "wwwroot"),
                Path.Combine(baseDir, "wwwroot"),
                Path.Combine(baseDir, "Desktop", "dist"),
            };

            var dir = new DirectoryInfo(baseDir);
            while (dir != null)
            {
                candidatas.Add(Path.Combine(dir.FullName, "Desktop", "dist"));
                dir = dir.Parent;
            }

            foreach (var c in candidatas.Distinct())
            {
                if (File.Exists(Path.Combine(c, "index.html")))
                    return c;
            }
            return null;
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                var result = MessageBox.Show(
                    "¿Está seguro de que desea cerrar el sistema?",
                    "Confirmar cierre",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question);

                if (result != DialogResult.Yes)
                {
                    e.Cancel = true;
                    return;
                }
            }

            _serverCts?.Cancel();
            base.OnFormClosing(e);
        }
    }
}
