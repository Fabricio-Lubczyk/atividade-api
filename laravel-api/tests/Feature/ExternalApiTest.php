<?php

namespace Tests\Feature;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use Tests\TestCase;

class ExternalApiTest extends TestCase
{
    public function test_pode_consumir_cotacoes_de_moedas_com_sucesso(): void
    {
        // Mock da resposta da AwesomeAPI
        Http::fake([
            'https://economia.awesomeapi.com.br/*' => Http::response([
                'USDBRL' => [
                    'code' => 'USD',
                    'name' => 'Dólar Americano/Real Brasileiro',
                    'bid' => '5.65',
                    'ask' => '5.66',
                    'varBid' => '0.02',
                    'pctChange' => '0.35',
                    'high' => '5.70',
                    'low' => '5.62',
                    'create_date' => '2026-10-17 17:00:00',
                ],
                'EURBRL' => [
                    'code' => 'EUR',
                    'name' => 'Euro/Real Brasileiro',
                    'bid' => '6.15',
                    'ask' => '6.16',
                    'varBid' => '-0.01',
                    'pctChange' => '-0.15',
                    'high' => '6.20',
                    'low' => '6.12',
                    'create_date' => '2026-10-17 17:00:00',
                ],
                'BTCBRL' => [
                    'code' => 'BTC',
                    'name' => 'Bitcoin/Real Brasileiro',
                    'bid' => '380000.00',
                    'ask' => '380100.00',
                    'varBid' => '1500.00',
                    'pctChange' => '0.40',
                    'high' => '385000.00',
                    'low' => '375000.00',
                    'create_date' => '2026-10-17 17:00:00',
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/external/cotacoes');

        $response->assertStatus(200)
            ->assertJsonPath('sucesso', true)
            ->assertJsonPath('moedas.dolar.codigo', 'USD')
            ->assertJsonPath('moedas.dolar.compra', 5.65)
            ->assertJsonPath('moedas.euro.codigo', 'EUR')
            ->assertJsonPath('moedas.bitcoin.codigo', 'BTC');
    }

    public function test_pode_consumir_pokeapi_com_sucesso(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/pikachu' => Http::response([
                'id' => 25,
                'name' => 'pikachu',
                'height' => 4,
                'weight' => 60,
                'types' => [
                    ['type' => ['name' => 'electric']],
                ],
                'abilities' => [
                    ['ability' => ['name' => 'static']],
                ],
                'stats' => [
                    ['base_stat' => 35, 'stat' => ['name' => 'hp']],
                    ['base_stat' => 55, 'stat' => ['name' => 'attack']],
                ],
                'sprites' => [
                    'front_default' => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
                    'other' => [
                        'official-artwork' => [
                            'front_default' => 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/api/external/pokemon/pikachu');

        $response->assertStatus(200)
            ->assertJsonPath('sucesso', true)
            ->assertJsonPath('dados.id', 25)
            ->assertJsonPath('dados.nome', 'Pikachu')
            ->assertJsonPath('dados.tipos.0', 'electric');
    }

    public function test_retorna_404_quando_pokemon_nao_encontrado(): void
    {
        Http::fake([
            'https://pokeapi.co/api/v2/pokemon/desconhecido123' => Http::response([], 404),
        ]);

        $response = $this->getJson('/api/external/pokemon/desconhecido123');

        $response->assertStatus(404)
            ->assertJsonPath('sucesso', false);
    }

    public function test_tenta_novamente_apos_falha_de_conexao(): void
    {
        Sleep::fake();
        $tentativas = 0;
        Http::fake(function () use (&$tentativas) {
            if (++$tentativas === 1) {
                throw new ConnectionException('DNS temporariamente indisponivel');
            }

            return Http::response(['id' => 25, 'name' => 'pikachu'], 200);
        });

        $response = $this->getJson('/api/external/pokemon/pikachu');

        $response->assertOk()->assertJsonPath('dados.id', 25);
        $this->assertSame(2, $tentativas);
        Http::assertSentCount(1);
    }

    public function test_retorna_502_quando_provedor_de_cotacoes_falha(): void
    {
        Http::fake(['https://economia.awesomeapi.com.br/*' => Http::response([], 503)]);

        $response = $this->getJson('/api/external/cotacoes');

        $response->assertStatus(502)->assertJsonPath('sucesso', false)->assertJsonPath('moedas', null);
        Http::assertSentCount(1);
    }

    public function test_reutiliza_consulta_pokemon_em_cache_por_uma_hora(): void
    {
        Http::fake(['https://pokeapi.co/*' => Http::response(['id' => 25, 'name' => 'pikachu'], 200)]);

        $this->getJson('/api/external/pokemon/pikachu')->assertOk();
        $this->getJson('/api/external/pokemon/pikachu')->assertOk()->assertJsonPath('dados.id', 25);

        Http::assertSentCount(1);
    }
}
