<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalApiService
{
    /**
     * Consome a API pública da AwesomeAPI para obter cotações de moedas em tempo real.
     * URL: https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL
     *
     * @return array<string, mixed>
     */
    public function getCotacoes(): array
    {
        if (($cached = Cache::get('external:cotacoes')) !== null) {
            return $cached;
        }

        try {
            $response = Http::withOptions([
                'force_ip_resolve' => 'v4',
            ])
                ->connectTimeout(5)
                ->timeout(15)
                ->retry(2, 200, fn (Exception $exception): bool => $exception instanceof ConnectionException, throw: false)
                ->acceptJson()
                ->get('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL');

            if ($response->failed()) {
                throw new Exception("Falha ao consultar cotações: status HTTP {$response->status()}");
            }

            $data = $response->json();

            // Formatação amigável dos dados consumidos
            $resultado = [
                'sucesso' => true,
                'fonte' => 'AwesomeAPI Cotações (https://economia.awesomeapi.com.br)',
                'consultado_em' => now()->toIso8601String(),
                'moedas' => [
                    'dolar' => [
                        'codigo' => 'USD',
                        'nome' => $data['USDBRL']['name'] ?? 'Dólar Americano/Real Brasileiro',
                        'compra' => (float) ($data['USDBRL']['bid'] ?? 0),
                        'venda' => (float) ($data['USDBRL']['ask'] ?? 0),
                        'variacao' => (float) ($data['USDBRL']['varBid'] ?? 0),
                        'porcentagem_variacao' => (float) ($data['USDBRL']['pctChange'] ?? 0),
                        'maxima' => (float) ($data['USDBRL']['high'] ?? 0),
                        'minima' => (float) ($data['USDBRL']['low'] ?? 0),
                        'atualizado_em' => $data['USDBRL']['create_date'] ?? null,
                    ],
                    'euro' => [
                        'codigo' => 'EUR',
                        'nome' => $data['EURBRL']['name'] ?? 'Euro/Real Brasileiro',
                        'compra' => (float) ($data['EURBRL']['bid'] ?? 0),
                        'venda' => (float) ($data['EURBRL']['ask'] ?? 0),
                        'variacao' => (float) ($data['EURBRL']['varBid'] ?? 0),
                        'porcentagem_variacao' => (float) ($data['EURBRL']['pctChange'] ?? 0),
                        'maxima' => (float) ($data['EURBRL']['high'] ?? 0),
                        'minima' => (float) ($data['EURBRL']['low'] ?? 0),
                        'atualizado_em' => $data['EURBRL']['create_date'] ?? null,
                    ],
                    'bitcoin' => [
                        'codigo' => 'BTC',
                        'nome' => $data['BTCBRL']['name'] ?? 'Bitcoin/Real Brasileiro',
                        'compra' => (float) ($data['BTCBRL']['bid'] ?? 0),
                        'venda' => (float) ($data['BTCBRL']['ask'] ?? 0),
                        'variacao' => (float) ($data['BTCBRL']['varBid'] ?? 0),
                        'porcentagem_variacao' => (float) ($data['BTCBRL']['pctChange'] ?? 0),
                        'maxima' => (float) ($data['BTCBRL']['high'] ?? 0),
                        'minima' => (float) ($data['BTCBRL']['low'] ?? 0),
                        'atualizado_em' => $data['BTCBRL']['create_date'] ?? null,
                    ],
                ],
            ];
            Cache::put('external:cotacoes', $resultado, 30);

            return $resultado;
        } catch (Exception $e) {
            Log::error('Erro ao consumir API de Cotações: '.$e->getMessage());

            return [
                'sucesso' => false,
                'mensagem' => 'Não foi possível obter as cotações no momento: '.$e->getMessage(),
                'moedas' => null,
            ];
        }
    }

    /**
     * Consome a API pública PokeAPI para obter informações de um pokémon.
     * URL: https://pokeapi.co/api/v2/pokemon/{name}
     *
     * @return array<string, mixed>
     */
    public function getPokemon(string $nome): array
    {
        $nomeFormatado = strtolower(trim($nome));
        $cacheKey = "external:pokemon:{$nomeFormatado}";
        if (($cached = Cache::get($cacheKey)) !== null) {
            return $cached;
        }

        try {
            $response = Http::withOptions([
                'force_ip_resolve' => 'v4',
            ])
                ->connectTimeout(5)
                ->timeout(15)
                ->retry(2, 200, fn (Exception $exception): bool => $exception instanceof ConnectionException, throw: false)
                ->acceptJson()
                ->get("https://pokeapi.co/api/v2/pokemon/{$nomeFormatado}");

            if ($response->status() === 404) {
                return [
                    'sucesso' => false,
                    'mensagem' => "Pokémon '{$nome}' não encontrado.",
                    'dados' => null,
                ];
            }

            if ($response->failed()) {
                throw new Exception("Falha ao consultar PokeAPI: status HTTP {$response->status()}");
            }

            $data = $response->json();

            // Extrair tipos
            $tipos = array_map(function ($t) {
                return $t['type']['name'] ?? '';
            }, $data['types'] ?? []);

            // Extrair habilidades
            $habilidades = array_map(function ($a) {
                return $a['ability']['name'] ?? '';
            }, $data['abilities'] ?? []);

            // Extrair estatísticas base
            $stats = [];
            foreach ($data['stats'] ?? [] as $st) {
                $statName = $st['stat']['name'] ?? 'stat';
                $stats[$statName] = $st['base_stat'] ?? 0;
            }

            $resultado = [
                'sucesso' => true,
                'fonte' => 'PokeAPI (https://pokeapi.co)',
                'dados' => [
                    'id' => $data['id'] ?? null,
                    'nome' => ucfirst($data['name'] ?? $nome),
                    'altura' => ($data['height'] ?? 0) / 10 .' m',
                    'peso' => ($data['weight'] ?? 0) / 10 .' kg',
                    'imagem' => $data['sprites']['other']['official-artwork']['front_default']
                        ?? $data['sprites']['front_default']
                        ?? null,
                    'tipos' => $tipos,
                    'habilidades' => $habilidades,
                    'estatisticas' => $stats,
                ],
            ];
            Cache::put($cacheKey, $resultado, 3600);

            return $resultado;
        } catch (Exception $e) {
            Log::error("Erro ao consumir PokeAPI para '{$nome}': ".$e->getMessage());

            return [
                'sucesso' => false,
                'mensagem' => 'Não foi possível consultar o pokémon no momento: '.$e->getMessage(),
                'dados' => null,
            ];
        }
    }
}
