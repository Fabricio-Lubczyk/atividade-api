<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
class ExternalApiController extends Controller
{
    public function __construct(
        protected \App\Services\ExternalApiService $externalApiService
    ) {}

    /**
     * Retorna as cotações em tempo real obtidas da API pública (AwesomeAPI).
     */
    public function cotacoes(): \Illuminate\Http\JsonResponse
    {
        $resultado = $this->externalApiService->getCotacoes();
        $status = $resultado['sucesso'] ? 200 : 502;

        return response()->json($resultado, $status);
    }

    /**
     * Retorna os dados de um Pokémon obtidos da API pública (PokeAPI).
     */
    public function pokemon(string $name): \Illuminate\Http\JsonResponse
    {
        $resultado = $this->externalApiService->getPokemon($name);

        if (!$resultado['sucesso']) {
            $status = isset($resultado['mensagem']) && str_contains($resultado['mensagem'], 'não encontrado') ? 404 : 502;
            return response()->json($resultado, $status);
        }

        return response()->json($resultado, 200);
    }
}
