

**Facultad Regional de Villa María**  
Ingeniería en Sistemas de Información  
Ingeniería y Calidad de Software 2026

**Proyecto 3: Métricas**

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

## ***1\. Métricas de Proceso***

Evalúan la eficiencia del flujo de trabajo en Kanban y la rigurosidad de las prácticas de ingeniería del equipo durante el desarrollo.

### **1.1. Tiempo de Ciclo Promedio por Historia de Usuario (Cycle Time)**

* **Medidas base:**  
  * Timestamp de inicio (momento en que la HU pasa al estado *In Progress* en ClickUp).  
  * Timestamp de finalización (momento en que la HU pasa a *Done* tras fusionar la PR y superar las pruebas).  
  * Cantidad total de Historias de Usuario completadas (N).  
* **Fórmula de la Métrica:**  
  **Tiempo de Ciclo Promedio \= Σ (Timestamp Final \- Timestamp Inicio) / N**  
* **¿Por qué la elegimos?** Al trabajar con una metodología **Kanban** sin sprints fijos y con límites de WIP (Work In Progress), necesitamos medir la fluidez con la que las historias atraviesan el tablero. Permite detectar cuellos de botella rápidamente (por ejemplo, demoras en la integración entre el frontend en React y los contratos de API en NestJS) y mitigar el riesgo **R5** (retrasos en tareas críticas por disponibilidad parcial).  
* **¿Cómo la vamos a medir?** De forma semanal mediante los registros de actividad de **ClickUp**, contabilizando los días u horas netas que cada tarjeta permanece activa desde que un desarrollador la toma hasta que cumple el criterio de finalización.  
* **Indicador asociado (Umbral):** Si el Tiempo de Ciclo supera los **4 días** para historias de 1 a 2 Story Points (o **7 días** para las de 5 SP como *Registrar plan* o *Registrar entrenamiento*), se dispara una alerta para revisar bloqueos en un bot de Telegram.

### **1.2. Tasa de Revisión Colaborativa de Pull Requests**

* **Medidas base:**  
  * Número de Pull Requests (PR) integradas a la rama común que cuentan con aprobación formal de al menos 2 integrantes.  
  * Número total de Pull Requests integradas en el repositorio.  
* **Fórmula de la Métrica:**  
  **Tasa de Revisión \= (PRs con ≥ 2 Aprobaciones / Total PRs Integradas) × 100**  
* **¿Por qué la elegimos?** Responde directamente al objetivo de calidad de gestión colaborativa del SPMP y mitiga los riesgos **R2** (acumulación de deuda técnica o reglas de negocio fuera de la capa de dominio) y **R3** (problemas de integración entre capas). Asegura que todo el equipo mantenga visibilidad sobre el cumplimiento del lenguaje ubicuo y la arquitectura DDD.  
* **¿Cómo la vamos a medir?** Al cierre de cada semana de desarrollo, auditando el historial de *Pull Requests* cerradas/mergeadas en **GitHub** mediante filtros de revisión (reviewed-by).  
* **Indicador asociado (Umbral):** El objetivo fijado en el plan de calidad es de al menos **70%**. Si al finalizar una semana cae por debajo de este umbral, los encargados de gestión de repositorio bloquearán el merge directo exigiendo doble *approve* obligatorio en la configuración de ramas de GitHub.

## ***2\. Métricas de Producto***

Evalúan las características internas y externas del software entregado: tanto la solidez de su arquitectura de dominio como la experiencia de uso real en el gimnasio.

### **2.1. Cobertura de Pruebas Automatizadas en Reglas de Negocio**

* **Medidas base:**  
  * Cantidad de reglas de negocio e invariantes del dominio (de las documentadas en los agregados Plan, Entrenamiento, Alumno y Profesor) verificadas con al menos un test unitario o de integración que pasa satisfactoriamente.  
  * Cantidad total de reglas de negocio definidas en el análisis de dominio para el MVP (42 reglas, identificadas de `RN-01` a `RN-42`).  
* **Fórmula de la Métrica:**  
  **Cobertura \= (Reglas de Negocio Probadas Satisfactoriamente / Reglas de Negocio Totales) × 100**  
* **¿Por qué la elegimos?** En el diseño del MVP se decidió calcular en tiempo real datos críticos derivados (como el *récord histórico*, la *evolución por ejercicio* y el *estado temporal del plan*) y encapsular las invariantes dentro de las entidades y servicios de dominio (ej. no solapar fechas de planes con abarcaRangoDeFechas(), inmutabilidad de entrenamientos finalizados, o desasignación transaccional de alumnos al dar de baja un profesor). Un fallo lógico aquí corrompe el corazón del sistema, por lo que medir líneas de código genéricas no basta y se necesita medir la cobertura sobre las reglas del negocio (mitigando el riesgo **R4**).  
* **¿Cómo la vamos a medir?** Se declara la trazabilidad en el nombre de cada test, con el identificador de la regla entre corchetes: `it('[RN-09] no permite planes con fechas solapadas', ...)`. El reporte JSON de Vitest (`vitest run --reporter=json`) se procesa automáticamente: se extraen los identificadores `[RN-nn]` de los tests que pasan satisfactoriamente y se comparan contra las 42 reglas del documento normativo del dominio. El resultado se publica en el reporte semanal de métricas y se valida en cada Pull Request mediante un gate que falla si una regla declarada por la historia de usuario no tiene test asociado.  
* **Indicador asociado (Umbral):** Se debe alcanzar el **100 % de las reglas del dominio** antes del despliegue final en la Semana 9. El umbral se aplica en dos niveles: **(a) por historia de usuario**, ninguna HU se da por terminada mientras alguna regla que implementa carezca de un test asociado que pase satisfactoriamente; **(b) global**, al cierre del proyecto se exige la cobertura de las 42 reglas documentadas.
* **Indicador complementario (no oficial):** La cobertura de líneas y ramas sobre la capa de Dominio se reporta como diagnóstico de calidad, con las metas por módulo definidas en el Plan de pruebas. No se utiliza para calcular esta métrica ni para decidir el cierre de una historia de usuario.

### **2.2. Índice de Eficiencia Operativa en Flujos Críticos (UX / Tiempo de Tarea)**

* **Medidas base:**  
  * Tiempo en segundos (T\_real) que tarda un usuario en completar una operación crítica desde que inicia la acción en la interfaz hasta que recibe la confirmación o visualización de datos.  
  * Tiempo máximo objetivo (T\_meta) definido en la visión del dominio para esa operación.  
* **Fórmula de la Métrica:**  
  **Índice de Eficiencia \= (T\_real / T\_meta) × 100**  
* **¿Por qué la elegimos?** El propósito central del MVP de HercFit es reemplazar el registro manual en papel para evitar que los alumnos y profesores abandonen el seguimiento por resultar tedioso. La *Visión del Dominio* establece explícitamente metas de tiempo para saber si el producto es exitoso (ej. registrar un ejercicio y sus series en ≤ 30s, consultar un plan en ≤ 5s, registrar un plan nuevo en ≤ 60s). Esta métrica cuantifica directamente la usabilidad y velocidad de respuesta del producto (frontend \+ backend).  
* **¿Cómo la vamos a medir?** Durante las pruebas funcionales y manuales **E2E** en navegador web (móvil para alumnos y escritorio para profesores), cronometrando 5 ejecuciones de cada uno de los 5 flujos principales y calculando el tiempo promedio obtenido para cada flujo sobre el entorno desplegado en Heroku/Neon Tech.  
* **Indicador asociado (Umbral):** El índice promedio de eficiencia debe ser menor al 120% del tiempo meta en los 5 flujos del dominio evaluados. Si en una prueba aislada se supera el 100% del tiempo establecido, se tomará como una advertencia. Solo se exigirá un rediseño obligatorio en la interacción de la UI o una optimización en la base de datos si el tiempo promedio de la tarea supera el 120%, o si más de una prueba particular presenta bloqueos graves que superen holgadamente este límite. 

## ***3\. Métricas de Proyecto***

Evalúan la salud gerencial del proyecto: el control del cronograma, el cumplimiento de las entregas pactadas y la precisión de las estimaciones del equipo.

### **3.1. Tasa de Rendimiento del Flujo (Throughput Semanal de HUs)**

* **Medidas base:**  
  * Cantidad de tarjetas de Historias de Usuario que pasan a estado *Done* durante una semana activa de desarrollo.  
* **Fórmula:**  
  **Throughput Semanal \= Total de HUs en estado "Done" por semana**  
* **¿Por qué elegirla?** Mide la **cadencia y velocidad real de entrega del equipo** por unidad de tiempo sin importar la estimación previa. Es clave en Kanban para detectar si el equipo se está desacelerando o si los límites de trabajo en progreso (WIP) están funcionando bien.  
* **¿Cómo medirla?** Al finalizar cada semana de desarrollo desde los reportes de ClickUp.  
* **Indicador asociado (Umbral):** Un promedio mínimo de **3 a 5 HUs completadas por semana activa** de desarrollo para garantizar la entrega del MVP en la Semana 9\.

**3.2. Lead Time de Funcionalidad (Tiempo Total de Entrega)**

* **Medidas base:**  
  * Timestamp en el que la historia de usuario pasa al estado "Ready to do" (lista para ser desarrollada), dejando de contabilizar el tiempo pasivo en el backlog general.   
  * Timestamp en el que finalmente se despliega en el entorno de pruebas.  
* **Fórmula de la Métrica**  
  **Lead Time Promedio \= $\Sigma$ (Timestamp de Despliegue \- Timestamp de pase a "Ready to do") / Cantidad de HUs evaluadas.**   
* **¿Por qué la elegimos?** Complementa perfectamente la métrica de *Cycle Time*. Mientras el ciclo evalúa estrictamente el tiempo de desarrollo del equipo, el *Lead Time* evalúa la salud gerencial del proyecto: cuánto tarda una necesidad de negocio en ser construida e integrada en el entorno de pruebas para validar el funcionamiento del MVP, de cara al despliegue final en la Semana 9\.   
* **Indicador asociado (Umbral):** El promedio de entrega debe ser inferior a 14 días activos de desarrollo (excluyendo formalmente los períodos de pausa programada o inactividad académica del equipo) para funcionalidades troncales como el registro de planes o visualización de métricas. **Si el Lead Time de días activos supera este límite**, **se disparará una sesión de refinamiento para desglosar (split) las próximas historias en entregables más pequeños**, y **se evaluará reducir en 1 el límite WIP (Work In Progress) en ClickUp** para forzar el cierre de tareas en curso. 

