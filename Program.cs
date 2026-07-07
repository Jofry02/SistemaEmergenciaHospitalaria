using System.Windows.Forms;

namespace SistemaEmergenciaHospitalaria
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();

            Application.ThreadException += (s, e) =>
            {
                MessageBox.Show($"Error inesperado: {e.Exception.Message}",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };

            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                var ex = e.ExceptionObject as Exception;
                MessageBox.Show($"Error crítico: {ex?.Message}",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };

            Application.Run(new FrmPacientes());
        }
    }
}