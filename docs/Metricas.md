

**Facultad Regional de Villa María**  
Ingeniería en Sistemas de Información  
Ingeniería y Calidad de Software 2026

**Proyecto 3: Plan de Métricas**

**Docente Del Curso:**   
Vanzetti, Juan Jose  
Toselli, Laura  

**Grupo:**   
10

**Integrantes:**   
Correa, Valentín \- 16.281 \- [correavale2004@gmail.com](mailto:correavale2004@gmail.com)  
Gómez Ferrero, Andrés \- 16.172 \- [andresgf925@gmail.com](mailto:andresgf925@gmail.com)   
Letona, Mateo \- 16.276 \- [mateolet883@gmail.com](mailto:mateolet883@gmail.com)   
Liendo Ortiz, Agustín \- 15.875 \- [agusliendo2004@gmail.com](mailto:agusliendo2004@gmail.com)   
Wursten Gill, Santiago \- 15.905- [santiwgwuri@gmail.com](mailto:-santiwgwuri@gmail.com) 

**Fecha de entrega:** 14/12/2026  
**Año de Cursado:** 2026  
***Historial de versiones***

| Versión | Autores | Descripción de la versión | Fecha de finalización |
| :---: | ----- | ----- | :---: |
| Borrador | Correa, Valentin; Gómez Ferrero, Andrés; Letona, Mateo; Liendo Ortiz, Agustín; Wursten Gill, Santiago | Borrador inicial creado para distribución y revisión. | 27/10/26 |

##  

***ÍNDICE***

**[1\. Métricas de Proceso	3](#1.-métricas-de-proceso)**

[1.1. Tiempo de Ciclo Promedio por Historia de Usuario (Cycle Time)	3](#1.1.-tiempo-de-ciclo-promedio-por-historia-de-usuario-\(cycle-time\))

[1.2. Tasa de Revisión Colaborativa de Pull Requests	3](#1.2.-tasa-de-revisión-colaborativa-de-pull-requests)

[**2\. Métricas de Producto	4**](#2.-métricas-de-producto)

[2.1. Cobertura de Pruebas Automatizadas en Reglas de Negocio	4](#2.1.-cobertura-de-pruebas-automatizadas-en-reglas-de-negocio)

[2.2. Índice de Eficiencia Operativa en Flujos Críticos (UX / Tiempo de Tarea)	5](#2.2.-índice-de-eficiencia-operativa-en-flujos-críticos-\(ux-/-tiempo-de-tarea\))

[**3\. Métricas de Proyecto	5**](#3.-métricas-de-proyecto)

[3.1. Tasa de Rendimiento del Flujo (Throughput Semanal de HUs)	6](#3.1.-tasa-de-rendimiento-del-flujo-\(throughput-semanal-de-hus\))

[3.2. Lead Time de Funcionalidad (Tiempo Total de Entrega)	6](#3.2.-lead-time-de-funcionalidad-\(tiempo-total-de-entrega\))

[**4\. Proceso de evaluación automatizada de métricas	7**](#4.-proceso-de-evaluación-automatizada-de-métricas)

## 

# ***1\. Métricas de Proceso*** {#1.-métricas-de-proceso}

Evalúan la eficiencia del flujo de trabajo en Kanban y la rigurosidad de las prácticas de ingeniería del equipo durante el desarrollo.

## *1.1. Tiempo de Ciclo Promedio por Historia de Usuario (Cycle Time)* {#1.1.-tiempo-de-ciclo-promedio-por-historia-de-usuario-(cycle-time)}

* **Medidas y/o datos base:**  
  * Timestamp de inicio (momento en que la HU pasa al estado *In Progress* en ClickUp).  
  * Timestamp de finalización (momento en que la HU pasa a *Done* tras fusionar la PR y superar las pruebas).  
  * Cantidad total de Historias de Usuario completadas (N).  
* **Fórmula de la Métrica:**  
  **Tiempo de Ciclo Promedio \= Σ (Timestamp Final \- Timestamp Inicio) / N**  
* **¿Por qué la elegimos?** Al trabajar con una metodología **Kanban** sin sprints fijos y con límites de WIP (Work In Progress), necesitamos medir la fluidez con la que las historias atraviesan el tablero. Permite detectar cuellos de botella rápidamente (por ejemplo, demoras en la integración entre el frontend en React y los contratos de API en NestJS) y mitigar el riesgo **R5** (retrasos en tareas críticas por disponibilidad parcial).  
* **¿Cómo la vamos a medir?** De forma semanal mediante los registros de actividad de **ClickUp**, contabilizando los días u horas netas que cada tarjeta permanece activa desde que un desarrollador la toma hasta que cumple el criterio de finalización.  
* **Indicador asociado (Umbral):** Si el Tiempo de Ciclo supera los **4 días** para historias de 1 a 2 Story Points (o **7 días** para las de 5 SP como *Registrar plan* o *Registrar entrenamiento*), se dispara una alerta para revisar bloqueos en un bot de Telegram.

## *1.2. Tasa de Revisión Colaborativa de Pull Requests* {#1.2.-tasa-de-revisión-colaborativa-de-pull-requests}

* **Medidas y/o datos base:**  
  * Número de Pull Requests (PR) integradas a la rama común que cuentan con aprobación formal de al menos 2 integrantes.  
  * Número total de Pull Requests integradas en el repositorio.  
* **Fórmula de la Métrica:**  
  **Tasa de Revisión \= (PRs con ≥ 2 Aprobaciones / Total PRs Integradas) × 100**  
* **¿Por qué la elegimos?** Responde directamente al objetivo de calidad de gestión colaborativa del SPMP y mitiga los riesgos **R2** (acumulación de deuda técnica o reglas de negocio fuera de la capa de dominio) y **R3** (problemas de integración entre capas). Asegura que todo el equipo mantenga visibilidad sobre el cumplimiento del lenguaje ubicuo y la arquitectura DDD.  
* **¿Cómo la vamos a medir?** Al cierre de cada semana de desarrollo, auditando el historial de *Pull Requests* cerradas/mergeadas en **GitHub** mediante filtros de revisión (reviewed-by).  
* **Indicador asociado (Umbral):** El objetivo fijado en el plan de calidad es de al menos **70%**. Si al finalizar una semana cae por debajo de este umbral, los encargados de gestión de repositorio bloquearán el merge directo exigiendo doble *approve* obligatorio en la configuración de ramas de GitHub.

# ***2\. Métricas de Producto*** {#2.-métricas-de-producto}

Evalúan las características internas y externas del software entregado: tanto la solidez de su arquitectura de dominio como la experiencia de uso real en el gimnasio.

## *2.1. Cobertura de Pruebas Automatizadas en Reglas de Negocio* {#2.1.-cobertura-de-pruebas-automatizadas-en-reglas-de-negocio}

* **Medidas y/o datos base:**  
  * Cantidad de reglas de negocio e invariantes del dominio (de las documentadas en los agregados Plan, Entrenamiento, Alumno y Profesor) verificadas con al menos un test unitario o de integración que pasa satisfactoriamente.  
  * Cantidad total de reglas de negocio definidas en el análisis de dominio para el MVP.  
* **Fórmula de la Métrica:**  
  **Cobertura \= (Reglas de Negocio Probadas Satisfactoriamente / Reglas de Negocio Totales) × 100**  
* **¿Por qué la elegimos?** En el diseño del MVP se decidió calcular en tiempo real datos críticos derivados (como el *récord histórico*, la *evolución por ejercicio* y el *estado temporal del plan*) y encapsular las invariantes dentro de las entidades y servicios de dominio (ej. no solapar fechas de planes con abarcaRangoDeFechas(), inmutabilidad de entrenamientos finalizados, o desasignación transaccional de alumnos al dar de baja un profesor). Un fallo lógico aquí corrompe el corazón del sistema, por lo que medir líneas de código genéricas no basta y se necesita medir la cobertura sobre las reglas del negocio (mitigando el riesgo **R4**).  
* **¿Cómo la vamos a medir?** Se declara la trazabilidad en el nombre de cada test, con el identificador de la regla entre corchetes:   
  *it('\[RN-09\] no permite planes con fechas solapadas', () \=\> { ... });*  
  El reporte JSON de Vitest (*vitest run \--reporter=json*) se procesa automáticamente: se extraen los identificadores *\[RN-nn\]* de los tests que pasan y se comparan contra las reglas del documento normativo del dominio. El resultado se publica en el reporte semanal que envía el bot de telegram y se valida en cada Pull Request con un gate que falla si una regla declarada por la historia de usuario no tiene test asociado.  
* **Indicador asociado (Umbral):** Debe alcanzar el **100%** de las reglas del dominio antes del despliegue final en la Semana 9\. Si alguna regla implementada carece de test asociado, la Historia de Usuario no se da por terminada.

## *2.2. Índice de Eficiencia Operativa en Flujos Críticos (UX / Tiempo de Tarea)* {#2.2.-índice-de-eficiencia-operativa-en-flujos-críticos-(ux-/-tiempo-de-tarea)}

* **Medidas y/o datos base:**  
  * Tiempo en segundos (T\_real) que tarda un usuario en completar una operación crítica desde que inicia la acción en la interfaz hasta que recibe la confirmación o visualización de datos.  
  * Tiempo máximo objetivo (T\_meta) definido en la visión del dominio para esa operación.  
* **Fórmula de la Métrica:**  
  **Índice de Eficiencia \= (T\_real / T\_meta) × 100**  
* **¿Por qué la elegimos?** El propósito central del MVP de HercFit es reemplazar el registro manual en papel para evitar que los alumnos y profesores abandonen el seguimiento por resultar tedioso. La *Visión del Dominio* establece explícitamente metas de tiempo para saber si el producto es exitoso (ej. registrar un ejercicio y sus series en ≤ 30s, consultar un plan en ≤ 5s, registrar un plan nuevo en ≤ 60s). Esta métrica cuantifica directamente la usabilidad y velocidad de respuesta del producto (frontend \+ backend).  
* **¿Cómo la vamos a medir?** Durante las pruebas funcionales y anuales **E2E** en navegador web (móvil para alumnos y escritorio para profesores), cronometrando 5 ejecuciones de cada uno de los 5 flujos principales y calculando el tiempo promedio obtenido para cada flujo sobre el entorno desplegado en Heroku/Neon Tech.  
* **Indicador asociado (Umbral):** El índice promedio de eficiencia debe ser menor al 120% del tiempo meta en los 5 flujos del dominio evaluados. Si en una prueba aislada se supera el 100% del tiempo establecido, se tomará como una advertencia. Solo se exigirá un rediseño obligatorio en la interacción de la UI o una optimización en la base de datos si el tiempo promedio de la tarea supera el 120%, o si más de una prueba particular presenta bloqueos graves que superen holgadamente este límite. 

# ***3\. Métricas de Proyecto*** {#3.-métricas-de-proyecto}

Evalúan la salud gerencial del proyecto: el control del cronograma, el cumplimiento de las entregas pactadas y la precisión de las estimaciones del equipo.

## *3.1. Tasa de Rendimiento del Flujo (Throughput Semanal de HUs)* {#3.1.-tasa-de-rendimiento-del-flujo-(throughput-semanal-de-hus)}

* **Medidas y/o datos base:**  
  * Cantidad de tarjetas de Historias de Usuario que pasan a estado *Done*.  
* **Fórmula:**  
  **Throughput Semanal \= Total de HUs en estado "Done" por semana**  
* **¿Por qué elegirla?** Mide la **cadencia y velocidad real de entrega del equipo** por unidad de tiempo sin importar la estimación previa. Es clave en Kanban para detectar si el equipo se está desacelerando o si los límites de trabajo en progreso (WIP) están funcionando bien.  
* **¿Cómo medirla?** Al finalizar cada semana de desarrollo desde los reportes de ClickUp.  
* **Indicador asociado (Umbral):** El promedio de HUs completadas por semana debe ser mayor a **4**. Si el rendimiento cae por debajo de este valor, se convocará inmediatamente a una reunión de equipo para analizar los inconvenientes y ajustar el flujo de trabajo.

## *3.2. Lead Time de Funcionalidad (Tiempo Total de Entrega)* {#3.2.-lead-time-de-funcionalidad-(tiempo-total-de-entrega)}

* **Medidas y/o datos base:**  
  * Timestamp en el que la historia de usuario pasa al estado "Ready to do" (lista para ser desarrollada), dejando de contabilizar el tiempo pasivo en el backlog general.   
  * Timestamp en el que finalmente se integra en la rama develop.  
* **Fórmula de la Métrica**  
  **Lead Time Promedio \= $\Sigma$ (Timestamp de Despliegue \- Timestamp de pase a "Ready to do") / Cantidad de HUs evaluadas.**   
* **¿Por qué la elegimos?** Complementa perfectamente la métrica de *Cycle Time*. Mientras el ciclo evalúa estrictamente el tiempo de desarrollo del equipo, el *Lead Time* evalúa la salud gerencial del proyecto: cuánto tarda una necesidad de negocio en ser construida e integrada en la rama develop para validar el funcionamiento del MVP, de cara al despliegue final en la Semana 9\.   
* **Indicador asociado (Umbral):** El promedio de entrega debe ser inferior a 14 días activos de desarrollo (excluyendo formalmente los períodos de pausa programada o inactividad académica del equipo) para funcionalidades troncales como el registro de planes o visualización de métricas. **Si el Lead Time de días activos supera este límite**, **se disparará una sesión de refinamiento para desglosar (split) las próximas historias en entregables más pequeños**, y **se evaluará reducir en 1 el límite WIP (Work In Progress) en ClickUp** para forzar el cierre de tareas en curso. 

# ***4\. Proceso de evaluación automatizada de métricas***  {#4.-proceso-de-evaluación-automatizada-de-métricas}

La evaluación se automatiza mediante el repositorio **`hercfit-metrics`**, que actúa como colector: no contiene lógica del producto, solo lee las fuentes de datos y produce el reporte. Se ejecuta en GitHub Actions con una programación diaria a las 09:00 (hora Argentina) y también puede dispararse manualmente o ante eventos de los repositorios.

## *4.1. Fuentes de datos por métrica* {#4.1.-fuentes-de-datos-por-métrica}

| Métrica | Fuente | Mecanismo |
| :---- | :---- | :---- |
| 1.1 Cycle Time | ClickUp | Snapshot diario del estado de cada tarjeta |
| 1.2 Tasa de revisión | GitHub | Pull Requests mergeadas y sus revisiones |
| 2.1 Cobertura de reglas | Vitest | Reporte JSON y tags `[RN-nn]` en los tests |
| 2.2 Eficiencia operativa | Medición manual | E2E cronometrado sobre el entorno desplegado |
| 3.1 Throughput | ClickUp | HUs completadas por semana de desarrollo |
| 3.2 Lead Time | GitHub | Merge a `develop` declarado en el Pull Request |

## *4.2. Recolección* {#4.2.-recolección}

**ClickUp.** La API no expone el historial de transiciones en el plan del equipo (el endpoint de tiempo por estado responde 403), por lo que el colector guarda un snapshot diario con el estado de cada tarjeta. La transición a *In Progress* se reconstruye por diferencia entre snapshots y la finalización usa la fecha de cierre exacta que provee ClickUp. Las historias se identifican por el campo *Tipo de Tarea* = *Historia de Usuario*, no por el nombre.

**GitHub.** Se consultan las Pull Requests mergeadas de ambos repositorios y, para cada una, sus revisiones. Una PR cuenta como revisada cuando tiene al menos dos aprobaciones de personas distintas, excluyendo al autor y a los bots, y considerando el último estado de cada revisor: un cambio solicitado posterior invalida una aprobación anterior.

**Vitest.** El pipeline del backend ejecuta la suite con salida JSON y el colector extrae los identificadores `[RN-nn]` de los tests que pasan. El catálogo de reglas se lee del documento normativo del dominio, sin una segunda copia que pueda desincronizarse.

## *4.3. Cálculo y umbrales* {#4.3.-cálculo-y-umbrales}

| Métrica | Cálculo | Umbral |
| :---- | :---- | :---- |
| 1.1 Cycle Time | Promedio de días entre *In Progress* y la fecha de cierre | 4 días (1-2 SP), 7 días (5 SP) |
| 1.2 Tasa de revisión | PRs con ≥ 2 aprobaciones / PRs mergeadas × 100 | ≥ 70 % |
| 2.1 Cobertura de reglas | Reglas con test que pasa / reglas del documento × 100 | 100 % antes del despliegue final |
| 3.1 Throughput | Promedio de HUs completadas por semana de desarrollo | > 4 HUs por semana |
| 3.2 Lead Time | Promedio de días activos entre *Ready to do* y el merge a `develop` | < 14 días activos |

El Lead Time excluye los períodos de pausa programada definidos en el cronograma del proyecto. El Throughput promedia únicamente semanas con foco de desarrollo, por lo que las semanas de planificación y la pausa no afectan el indicador.

## *4.4. Alertas* {#4.4.-alertas}

El reporte se publica en el repositorio y se envía a un bot de Telegram con las métricas en estado de alerta. Se notifica cuando una historia en progreso supera su umbral de Cycle Time, cuando la tasa de revisión cae por debajo del 70 %, cuando la cobertura de reglas no alcanza el 100 %, cuando el promedio de Throughput no supera las 4 HUs semanales o cuando un Lead Time excede los 14 días activos.

## *4.5. Verificación en el flujo de desarrollo* {#4.5.-verificación-en-el-flujo-de-desarrollo}

El pipeline del backend ejecuta verificación de tipos, análisis estático, la suite de pruebas y el gate de cobertura de reglas. El gate exige que toda regla declarada por una historia de usuario tenga al menos un test que pase: si falta, la integración falla y la historia no se considera terminada. Antes del despliegue final se ejecuta el mismo gate en su modo estricto, que exige el 100 % de las reglas del dominio.

## *4.6. Convenciones que sostienen la automatización* {#4.6.-convenciones-que-sostienen-la-automatización}

- **Estados en ClickUp:** las tarjetas se mueven a *In Progress* al comenzar el desarrollo, a *Ready to do* antes de tomarlas y a *Done* únicamente tras fusionar la PR y superar las pruebas.
- **Tags en los tests:** cada test declara las reglas que verifica con el formato `[RN-09]` en su nombre.
- **Declaración en el Pull Request:** cada PR incluye una línea `Reglas: RN-01, RN-05` con las reglas que implementa y una línea `HU: <n>` con la historia de usuario asociada, que es la que permite calcular el Lead Time.

## *4.7. Limitaciones conocidas* {#4.7.-limitaciones-conocidas}

- El inicio del Cycle Time tiene precisión de un día, porque se observa mediante snapshot diario y no por evento.
- El Lead Time requiere que la historia se integre a `develop` y que el Pull Request la declare; sin esa declaración la historia no es medible.
- La métrica 2.2 se mide de forma manual por decisión del equipo, dado que evalúa tiempos de interacción humana que no pueden inferirse del código.
- Las reglas de protección de rama que bloquearían el merge ante un gate fallido requieren un plan pago de GitHub; en el plan actual el resultado del pipeline es informativo.