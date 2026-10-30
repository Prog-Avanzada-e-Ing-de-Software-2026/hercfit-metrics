# hercfit-metrics

Recolección y reporte automático de las métricas del MVP de HercFit.

El repositorio no contiene lógica del producto: solo lee el tablero de ClickUp, los Pull Requests de GitHub y el reporte de pruebas del backend, y produce un reporte semanal con el estado de cada indicador.

El documento normativo de las métricas vive en [`docs/Metricas.md`](docs/Metricas.md) y es la fuente de verdad de las fórmulas y los umbrales que aplica este colector. Ante cualquier discrepancia entre el código y ese documento, el documento manda y el código se corrige.

## Métricas cubiertas

| Métrica | Fuente | Automatización |
| --- | --- | --- |
| 1.1 Cycle Time por HU | ClickUp | Completa, con snapshot diario |
| 1.2 Tasa de revisión de PRs | GitHub | Completa |
| 2.1 Cobertura de reglas de negocio | Reporte JSON de Vitest | Completa |
| 2.2 Eficiencia operativa (UX) | Medición manual E2E | Manual por decisión del SPMP |
| 3.1 Throughput semanal | ClickUp | Completa |
| 3.2 Lead Time | ClickUp | Completa, con proxy de despliegue |

## Cómo se obtiene cada dato

**Cycle Time.** ClickUp no expone el historial de transiciones en el plan del equipo
(`/task/{id}/time_in_status` responde 403), así que el colector guarda un snapshot diario del
estado de cada tarjeta en `state/snapshots/`. La transición a `in progress` se reconstruye por
diferencia entre snapshots; la finalización usa el `date_closed` exacto de ClickUp.

**Lead Time.** Arranca en el pase a `ready to do` y termina en el despliegue. La fecha de despliegue
sale de la corrida exitosa del workflow `deploy_heroku.yml` de `Proyecto3_Back`: GitHub no crea un
Deployment salvo que el job declare `environment`, así que la corrida del workflow es el evento real.
Los días se cuentan **activos**, según `config/calendario.json`: la semana 5 del cronograma es una
pausa programada y no suma.

**Cobertura de reglas.** Cada test declara las reglas que verifica en su nombre:

```ts
it('[RN-09] no permite planes con fechas solapadas', () => { ... });
```

El colector lee el reporte JSON de Vitest, extrae los tags de los tests que pasaron y los cruza
contra `rules/reglas.json` (42 reglas, generadas desde `Proyecto3_Back/docs/dominio/Reglas de negocio.md`).

**Tasa de revisión.** Cuenta como revisada una PR mergeada con al menos **dos aprobaciones de
personas distintas**, excluyendo al autor y a los bots. Se usa el último estado de cada revisor:
un `CHANGES_REQUESTED` posterior invalida un `APPROVED` anterior.

## Configuración

Copiar `.env.example` a `.env` y completar:

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `CLICKUP_TOKEN` | Sí | Leer el tablero |
| `CLICKUP_LIST_ID` | No | Lista del proyecto (por defecto `901717994296`) |
| `GH_PAT` | Para 1.2 | Leer PRs y reviews de ambos repositorios |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | No | Alertas |
| `VITEST_RESULTS` | Para 2.1 | Ruta al reporte JSON de Vitest |

En GitHub Actions las mismas variables se cargan como secrets del repositorio.

## Comandos

```bash
yarn install
yarn start            # snapshot + métricas + reporte + Telegram
yarn snapshot         # solo snapshot diario
yarn typecheck
yarn rules -- .vitest-results.json                      # reporta cobertura
yarn rules -- .vitest-results.json --story HU-1 --map rules/implemented.json   # gate por HU
yarn rules -- .vitest-results.json --all                # gate final: exige 100 %
```

## Gate de cobertura de reglas

El SPMP exige el **100 % de las reglas del dominio** antes del despliegue final, y que ninguna HU
se considere terminada si una regla que implementa carece de test.

Para que eso sea usable durante el desarrollo, el gate corre **por historia**:

1. `rules/implemented.json` declara qué reglas implementa cada HU.
2. En CI, el paso de la PR ejecuta `yarn rules -- <reporte> --story <HU> --map rules/implemented.json`.
   Si alguna regla declarada no tiene test que pase, el build falla.
3. Antes del despliegue final se ejecuta `--all`, que exige el 100 % de las 42 reglas.

## Limitaciones conocidas

- El inicio del Cycle Time tiene precisión de un día, porque se observa por snapshot diario.
- El Lead Time toma el primer deploy exitoso posterior al cierre de la historia. Si dos historias cierran juntas, comparten ese deploy.
- Los snapshots se versionan en el repositorio: sin ellos se pierde el historial de transiciones.
