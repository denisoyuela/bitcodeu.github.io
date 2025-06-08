document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let transacciones = JSON.parse(localStorage.getItem('transacciones')) || [];
    
    // Categorías predefinidas
    const categorias = {
        ingreso: ['Delcis Marquina', 'Paola Marquina', 'Jose Oyuela', 'Levis Oyuela', 'Luis .F', 'Francis Aguilar'],
        gasto: ['Delcis Marquina', 'Paola Marquina', 'Jose Oyuela', 'Levis Oyuela', 'Luis .F', 'Francis Aguilar', 'Otros gastos']
    };
    
    // Elementos del DOM
    const form = document.getElementById('transaccion-form');
    const tipoSelect = document.getElementById('tipo');
    const categoriaSelect = document.getElementById('categoria');
    const montoInput = document.getElementById('monto');
    const descripcionInput = document.getElementById('descripcion');
    const fechaInput = document.getElementById('fecha');
    const transaccionesLista = document.getElementById('transacciones-lista');
    const totalIngresos = document.getElementById('total-ingresos');
    const totalGastos = document.getElementById('total-gastos');
    const balanceTotal = document.getElementById('balance-total');
    const buscarInput = document.getElementById('buscar-transaccion');
    const analisisContenido = document.getElementById('analisis-contenido');
    
    // Inicializar la aplicación
    init();
    
    function init() {
        // Configurar fecha por defecto
        fechaInput.valueAsDate = new Date();
        
        // Cargar transacciones
        cargarTransacciones();
        
        // Actualizar resumen
        actualizarResumen();
        
        // Generar análisis inteligente
        generarAnalisis();
        
        // Event listeners
        tipoSelect.addEventListener('change', actualizarCategorias);
        form.addEventListener('submit', agregarTransaccion);
        buscarInput.addEventListener('input', buscarTransacciones);
    }
    
    function actualizarCategorias() {
        categoriaSelect.innerHTML = '<option value="">Seleccionar...</option>';
        
        const tipo = tipoSelect.value;
        if (!tipo) return;
        
        categorias[tipo].forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoriaSelect.appendChild(option);
        });
    }
    
    function agregarTransaccion(e) {
        e.preventDefault();
        
        const transaccion = {
            id: Date.now(),
            tipo: tipoSelect.value,
            categoria: categoriaSelect.value,
            monto: parseFloat(montoInput.value),
            descripcion: descripcionInput.value,
            fecha: fechaInput.value
        };
        
        transacciones.push(transaccion);
        guardarTransacciones();
        cargarTransacciones();
        actualizarResumen();
        generarAnalisis();
        
        // Resetear formulario
        form.reset();
        fechaInput.valueAsDate = new Date();
    }
    
    function cargarTransacciones() {
        transaccionesLista.innerHTML = '';
        
        transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        transacciones.forEach(transaccion => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatFecha(transaccion.fecha)}</td>
                <td>${transaccion.descripcion || 'Sin descripción'}</td>
                <td>${transaccion.categoria}</td>
                <td><span class="${transaccion.tipo}">${transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1)}</span></td>
                <td class="${transaccion.tipo}">${formatMoneda(transaccion.monto)}</td>
                <td>
                    <button class="btn btn-sm btn-danger eliminar-btn" data-id="${transaccion.id}">Eliminar</button>
                </td>
            `;
            
            transaccionesLista.appendChild(row);
        });
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.eliminar-btn').forEach(btn => {
            btn.addEventListener('click', eliminarTransaccion);
        });
    }
    
    function eliminarTransaccion(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        transacciones = transacciones.filter(t => t.id !== id);
        guardarTransacciones();
        cargarTransacciones();
        actualizarResumen();
        generarAnalisis();
    }
    
    function buscarTransacciones() {
        const termino = buscarInput.value.toLowerCase();
        
        if (!termino) {
            cargarTransacciones();
            return;
        }
        
        const transaccionesFiltradas = transacciones.filter(t => 
            t.descripcion.toLowerCase().includes(termino) || 
            t.categoria.toLowerCase().includes(termino) ||
            t.tipo.toLowerCase().includes(termino)
        );
        
        transaccionesLista.innerHTML = '';
        
        transaccionesFiltradas.forEach(transaccion => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatFecha(transaccion.fecha)}</td>
                <td>${transaccion.descripcion || 'Sin descripción'}</td>
                <td>${transaccion.categoria}</td>
                <td><span class="${transaccion.tipo}">${transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1)}</span></td>
                <td class="${transaccion.tipo}">${formatMoneda(transaccion.monto)}</td>
                <td>
                    <button class="btn btn-sm btn-danger eliminar-btn" data-id="${transaccion.id}">Eliminar</button>
                </td>
            `;
            
            transaccionesLista.appendChild(row);
        });
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.eliminar-btn').forEach(btn => {
            btn.addEventListener('click', eliminarTransaccion);
        });
    }
    
    function actualizarResumen() {
        const ingresos = transacciones
            .filter(t => t.tipo === 'ingreso')
            .reduce((total, t) => total + t.monto, 0);
        
        const gastos = transacciones
            .filter(t => t.tipo === 'gasto')
            .reduce((total, t) => total + t.monto, 0);
        
        const balance = ingresos - gastos;
        
        totalIngresos.textContent = formatMoneda(ingresos);
        totalGastos.textContent = formatMoneda(gastos);
        balanceTotal.textContent = formatMoneda(balance);
    }
    
    function generarAnalisis() {
        if (transacciones.length === 0) {
            analisisContenido.innerHTML = '<p class="text-muted">No hay suficientes datos para generar análisis. Agrega algunas transacciones.</p>';
            return;
        }
        
        // Análisis básico de gastos por categoría
        const gastosPorCategoria = {};
        categorias.gasto.forEach(categoria => {
            gastosPorCategoria[categoria] = 0;
        });
        
        transacciones
            .filter(t => t.tipo === 'gasto')
            .forEach(t => {
                gastosPorCategoria[t.categoria] += t.monto;
            });
        
        // Encontrar categoría con mayor gasto
        let mayorGastoCategoria = '';
        let mayorGastoMonto = 0;
        
        for (const categoria in gastosPorCategoria) {
            if (gastosPorCategoria[categoria] > mayorGastoMonto) {
                mayorGastoMonto = gastosPorCategoria[categoria];
                mayorGastoCategoria = categoria;
            }
        }
        
        // Generar HTML de análisis
        let html = '<h6>Análisis de Gastos</h6>';
        html += `<p>Tu mayor gasto es en <strong>${mayorGastoCategoria}</strong> con un total de ${formatMoneda(mayorGastoMonto)}.</p>`;
        
        // Análisis de balance mensual (simplificado)
        const balanceMensual = {};
        transacciones.forEach(t => {
            const fecha = new Date(t.fecha);
            const mesAnio = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
            
            if (!balanceMensual[mesAnio]) {
                balanceMensual[mesAnio] = 0;
            }
            
            balanceMensual[mesAnio] += t.tipo === 'ingreso' ? t.monto : -t.monto;
        });
        
        html += '<h6 class="mt-3">Balance Mensual</h6>';
        for (const mes in balanceMensual) {
            const clase = balanceMensual[mes] >= 0 ? 'text-success' : 'text-danger';
            html += `<p>${mes}: <span class="${clase}">${formatMoneda(balanceMensual[mes])}</span></p>`;
        }
        
        // Recomendaciones básicas
        html += '<h6 class="mt-3">Recomendaciones</h6>';
        const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((total, t) => total + t.monto, 0);
        const gastos = transacciones.filter(t => t.tipo === 'gasto').reduce((total, t) => total + t.monto, 0);
        
        if (gastos > ingresos * 0.7) {
            html += '<p class="text-danger">⚠️ Tus gastos representan más del 70% de tus ingresos. Considera reducir gastos.</p>';
        } else if (gastos > ingresos * 0.5) {
            html += '<p class="text-warning">⚠️ Tus gastos representan más del 50% de tus ingresos. Revisa tus gastos.</p>';
        } else {
            html += '<p class="text-success">✓ Tus finanzas parecen saludables. ¡Buen trabajo!</p>';
        }
        
        analisisContenido.innerHTML = html;
    }
    
    function guardarTransacciones() {
        localStorage.setItem('transacciones', JSON.stringify(transacciones));
    }
    
    // Funciones de utilidad
    function formatFecha(fechaStr) {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES');
    }
    
    function formatMoneda(monto) {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(monto);
    }


    document.getElementById('logoutbtN').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'indexx.html';
    });

    document.getElementById('logoutbtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'deuda.html';
    });

    document.getElementById('logoutbTn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'cerrar.html';
    });
});