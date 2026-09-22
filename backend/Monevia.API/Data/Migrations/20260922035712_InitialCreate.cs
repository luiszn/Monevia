using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FinanzasIA.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    Icono = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categorias_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MetodosPago",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetodosPago", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MetodosPago_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Presupuestos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    Periodo = table.Column<int>(type: "int", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Presupuestos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Presupuestos_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Presupuestos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Movimientos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoriaId = table.Column<int>(type: "int", nullable: false),
                    MetodoPagoId = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movimientos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Movimientos_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Movimientos_MetodosPago_MetodoPagoId",
                        column: x => x.MetodoPagoId,
                        principalTable: "MetodosPago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Movimientos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categorias",
                columns: new[] { "Id", "Color", "Icono", "Nombre", "Tipo", "UsuarioId" },
                values: new object[,]
                {
                    { 1, null, null, "Sueldo", 0, null },
                    { 2, null, null, "Freelance", 0, null },
                    { 3, null, null, "Venta", 0, null },
                    { 4, null, null, "Otros ingresos", 0, null },
                    { 5, null, null, "Alimentación", 1, null },
                    { 6, null, null, "Transporte", 1, null },
                    { 7, null, null, "Estudios", 1, null },
                    { 8, null, null, "Entretenimiento", 1, null },
                    { 9, null, null, "Salud", 1, null },
                    { 10, null, null, "Compras", 1, null },
                    { 11, null, null, "Servicios", 1, null },
                    { 12, null, null, "Otros", 1, null }
                });

            migrationBuilder.InsertData(
                table: "MetodosPago",
                columns: new[] { "Id", "Nombre", "UsuarioId" },
                values: new object[,]
                {
                    { 1, "Efectivo", null },
                    { 2, "Tarjeta de débito", null },
                    { 3, "Tarjeta de crédito", null },
                    { 4, "Transferencia", null },
                    { 5, "Yape", null },
                    { 6, "Plin", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_Nombre_Tipo_UsuarioId",
                table: "Categorias",
                columns: new[] { "Nombre", "Tipo", "UsuarioId" },
                unique: true,
                filter: "[UsuarioId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_UsuarioId",
                table: "Categorias",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MetodosPago_Nombre_UsuarioId",
                table: "MetodosPago",
                columns: new[] { "Nombre", "UsuarioId" },
                unique: true,
                filter: "[UsuarioId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MetodosPago_UsuarioId",
                table: "MetodosPago",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_CategoriaId",
                table: "Movimientos",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_MetodoPagoId",
                table: "Movimientos",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_UsuarioId_CategoriaId",
                table: "Movimientos",
                columns: new[] { "UsuarioId", "CategoriaId" });

            migrationBuilder.CreateIndex(
                name: "IX_Movimientos_UsuarioId_Fecha",
                table: "Movimientos",
                columns: new[] { "UsuarioId", "Fecha" });

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_CategoriaId",
                table: "Presupuestos",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_UsuarioId_CategoriaId_Periodo",
                table: "Presupuestos",
                columns: new[] { "UsuarioId", "CategoriaId", "Periodo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Movimientos");

            migrationBuilder.DropTable(
                name: "Presupuestos");

            migrationBuilder.DropTable(
                name: "MetodosPago");

            migrationBuilder.DropTable(
                name: "Categorias");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
