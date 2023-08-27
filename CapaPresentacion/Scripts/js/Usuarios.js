var tabladata;
var filaSeleccionada;


//carga inicial de la tabla
tabladata = $("#tabla").DataTable({
    responsive: true,
    ordering: false,
    "ajax": {
        url: bdir+ 'Home/ListarUsuarios',
        type: "GET",
        dataType: "json"
    },
    "columns": [
        { "data": "Nombres" },
        { "data": "Apellidos" },
        { "data": "Correo" },
        {
            "data": "Activo", "render": function (valor) {
                if (valor) {
                    return '<span class="badge bg-success">Si</span>'
                } else {
                    return '<span class="badge bg-danger">No</span>'
                }
            }

        },
        {
            "defaultContent": '<button type="button" class="btn btn-primary btn-sm btn-editar"><i class="fas fa-pen"></i></button>' +
                '<button type="button" class="btn btn-danger btn-sm ms-2 btn-eliminar"><i class="fas fa-trash"></i></button>',
            "orderable": false,
            "searchable": false,
            "width": "90px"
        }

    ],
    "language": {
        "url": "https://cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json"
    }

});


//abrir modal para crear nuevo
function abrirModal(json) {

    $("#txtid").val(0);
    $("#txtnombres").val("");
    $("#txtapellidos").val("");
    $("#txtcorreo").val("");
    $("#cboactivo").val(1);


    $("#mensajeError").hide();



    if (json != null) {


        $("#txtid").val(json.IdUsuario);
        $("#txtnombres").val(json.Nombres);
        $("#txtapellidos").val(json.Apellidos);
        $("#txtcorreo").val(json.Correo);
        $("#cboactivo").val(json.Activo == true ? 1 : 0);

    }

    $("#FormModal").modal("show");
}

//abrir modal con la data para editar
$("#tabla tbody").on("click", '.btn-editar', function () {


    filaSeleccionada = $(this).closest("tr");

    var data = tabladata.row(filaSeleccionada).data();

    abrirModal(data)

})

//eliminar la fila
$("#tabla tbody").on("click", '.btn-eliminar', function () {

    var usuarioseleccionado = $(this).closest("tr");

    var data = tabladata.row(usuarioseleccionado).data();


    swal({
        title: "Esta Seguro?",
        text: "¿Desea eliminar el usuario?",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-primary",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: true
    },
        function () {

            jQuery.ajax({
                url: bdir + 'Home/EliminarUsuario',  
                type: "POST",
                data: JSON.stringify({ id: data.IdUsuario }),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {

                    debugger;

                    if (data.resultado) {

                        tabladata.row(usuarioseleccionado).remove().draw();
                    } else {

                        swal("No se pudo eliminar", data.mensaje, "error")
                    }
                },
                error: function (error) {
                    console.log(error)
                }
            });




        });


    console.log(data);

})

//funcion guardar
function Guardar() {

    var Usuario = {

        IdUsuario: $("#txtid").val(),
        Activo: $("#cboactivo").val() == 1 ? true : false,
        Apellidos: $("#txtapellidos").val(),
        Correo: $("#txtcorreo").val(),
        Nombres: $("#txtnombres").val()
    }


    jQuery.ajax({
        url: bdir + 'Home/GuardarUsuarios', 
        type: "POST",
        data: JSON.stringify({ objeto: Usuario }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {

            $(".modal-body").LoadingOverlay("hide");

            //USUARIO NUEVO
            if (Usuario.IdUsuario == 0) {

                if (data.resultado != 0) {

                    Usuario.IdUsuario = data.resultado;
                    tabladata.row.add(Usuario).draw(false);
                    $("#FormModal").modal("hide");

                } else {
                    $("#mensajeError").text(data.mensaje);
                    $("#mensajeError").show();
                }
            }
            //USUARIO EDITAR
            else {

                if (data.resultado) {

                    tabladata.row(filaSeleccionada).data(Usuario).draw(false);
                    filaSeleccionada = null;
                    $("#FormModal").modal("hide");
                } else {
                    $("#mensajeError").text(data.mensaje);
                    $("#mensajeError").show();
                }
            }
        },
        error: function (error) {

            $(".modal-body").LoadingOverlay("hide");
            $("#mensajeError").text("Error Ajax");
            $("#mensajeError").show();
        },
        beforeSend: function () {
            $(".modal-body").LoadingOverlay("show", {
                imageResizeFactor: 2,
                text: "Cargando...",
                size: 14
            })
        }
    });




}