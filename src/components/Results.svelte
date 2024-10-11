<script>
  import { onMount } from 'svelte';
  import { obraContent, bancoContent, comparacionResultados, progreso } from "../stores.js";

  let isLoading = true;

  function analyzeBC3File(content) {
    const lines = content.split('\n');
    const partidas = [];

    for (let line of lines) {
      if (line.startsWith('~C|')) {
        const parts = line.split('|');
        if (parts.length >= 4) {
          partidas.push({
            codigo: parts[2].trim(),
            nombre: parts[3].trim(),
            unidad: parts[4] ? parts[4].trim() : '',
            precio: parts[5] ? parseFloat(parts[5].trim()) : 0
          });
        }
      }
    }

    return partidas;
  }

  function calculateSimilarity(a, b) {
    const nameScore = stringSimilarity(a.nombre, b.nombre);
    const unitScore = a.unidad === b.unidad ? 1 : 0;
    const priceScore = 1 - Math.abs(a.precio - b.precio) / Math.max(a.precio, b.precio, 1);

    return (nameScore * 0.6 + unitScore * 0.2 + priceScore * 0.2) * 100;
  }

  function stringSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    if (maxLen > 100) {
      str1 = str1.substring(0, 100);
      str2 = str2.substring(0, 100);
    }
    const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i - 1] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1
          );
        }
      }
    }

    return 1 - matrix[len2][len1] / maxLen;
  }

  async function comparePartidas(obraPartidas, bancoPartidas) {
    const total = obraPartidas.length;
    for (let i = 0; i < total; i++) {
      const obraPartida = obraPartidas[i];
      let bestMatch = null;
      let bestScore = -1;

      for (const bancoPartida of bancoPartidas) {
        const score = calculateSimilarity(obraPartida, bancoPartida);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = bancoPartida;
        }
      }

      $comparacionResultados = [...$comparacionResultados, {
        obra: obraPartida,
        banco: bestMatch,
        score: bestScore.toFixed(2)
      }];

      $progreso = ((i + 1) / total) * 100;

      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  onMount(async () => {
    const obraPartidas = $obraContent ? analyzeBC3File($obraContent) : [];
    const bancoPartidas = $bancoContent ? analyzeBC3File($bancoContent) : [];
    
    $comparacionResultados = [];
    $progreso = 0;
    
    await comparePartidas(obraPartidas, bancoPartidas);
    
    isLoading = false;
  });
</script>

<div class="mb-4">
  <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
    <div class="bg-blue-600 h-2.5 rounded-full" style="width: {$progreso}%"></div>
  </div>
  <p class="text-sm text-gray-600 mt-2">Progreso: {$progreso.toFixed(2)}%</p>
</div>

{#if $comparacionResultados.length > 0}
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Obra</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partida Obra</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad Obra</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Banco</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partida Banco</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad Banco</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each $comparacionResultados as resultado}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">{resultado.obra.codigo}</td>
            <td class="px-6 py-4 whitespace-nowrap">{resultado.obra.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap">{resultado.obra.unidad}</td>
            <td class="px-6 py-4 whitespace-nowrap">{resultado.banco?.codigo || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">{resultado.banco?.nombre || 'No encontrado'}</td>
            <td class="px-6 py-4 whitespace-nowrap">{resultado.banco?.unidad || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">{resultado.score}%</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else if !isLoading}
  <p class="text-center text-gray-600">No se encontraron partidas para comparar. Por favor, asegúrate de subir archivos BC3 válidos.</p>
{/if}