<?php

use App\Http\Controllers\Api\ExternalApiController;
use App\Http\Controllers\Api\ProdutoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas da API
|--------------------------------------------------------------------------
|
| Aqui são registradas as rotas da API para a aplicação.
|
*/

// Status da API
Route::get('/status', function () {
    return response()->json([
        'status' => 'online',
        'versao_laravel' => app()->version(),
        'mensagem' => 'API RESTful Laravel funcionando perfeitamente!',
        'horario' => now()->toIso8601String(),
    ]);
});

// CRIAÇÃO DE API: Rotas RESTful completas de Produtos utilizando Resource
Route::apiResource('produtos', ProdutoController::class);

// CONSUMO DE API: Rotas que consomem APIs públicas externas
Route::prefix('external')->group(function () {
    // Consome AwesomeAPI (Cotações USD, EUR, BTC em BRL)
    Route::get('/cotacoes', [ExternalApiController::class, 'cotacoes']);

    // Consome PokeAPI (Dados e imagens de Pokémon)
    Route::get('/pokemon/{name}', [ExternalApiController::class, 'pokemon']);
});

