# Estilo de código del equipo

Backend y frontend usan **Prettier 3.9.10**, con la misma configuración en `.prettierrc`, `.editorconfig` y `.vscode/settings.json`. La versión está fijada sin `^` ni `~` y registrada en `package-lock.json`: instalar las dependencias con `npm ci`.

| Regla                        | Convención                                              |
| ---------------------------- | ------------------------------------------------------- |
| Sangría                      | 2 espacios, sin tabulaciones                            |
| Comillas en JavaScript y JSX | Dobles                                                  |
| Punto y coma                 | Sí                                                      |
| Comas finales                | Donde la sintaxis lo permite                            |
| Ancho de línea               | 90 columnas como referencia; Prettier decide los cortes |
| Codificación y fin de línea  | UTF-8 y LF, también en Windows                          |
| Final de archivo             | Una nueva línea                                         |

No se ajusta el formato a mano según preferencias personales. Prettier aplica las reglas de cada lenguaje; por ejemplo, Markdown o YAML no usan las mismas convenciones de sintaxis que JavaScript. Los saltos manuales significativos de Markdown se respetan.

## Comandos

Desde la raíz de cualquiera de los dos repositorios:

```bash
npm ci
npm run format
npm run format:check
npm run lint
```

`format` corrige los archivos compatibles; `format:check` comprueba todo el repositorio sin escribir y falla si encuentra diferencias. `.prettierignore` excluye dependencias, salidas generadas, el lockfile administrado por npm y herramientas externas. Los binarios y formatos no soportados por Prettier quedan fuera del formateador.

En VS Code, instalar las extensiones recomendadas del workspace. Se configura Prettier como formateador y se activa el formato al guardar. En otros editores, habilitar EditorConfig y usar la versión local de Prettier del repositorio.

ESLint mantiene las reglas correspondientes al entorno Node.js o React y comprueba problemas de código. El formato visual lo define Prettier. El CI de ambos repositorios ejecuta `format:check` y `lint`; se deben aprobar antes de integrar un PR.

Si el equipo cambia una regla o la versión de Prettier, actualizar ambos repositorios y ejecutar el formateo completo en el mismo cambio.
