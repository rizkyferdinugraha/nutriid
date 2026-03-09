<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\NutritionProfileUpdateRequest;
use App\Models\NutritionProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NutritionProfileController extends Controller
{
    /**
     * Show nutrition profile settings page.
     */
    public function edit(Request $request): Response
    {
        $profile = NutritionProfile::where('user_id', Auth::id())->first();
        
        return Inertia::render('settings/nutrition-profile', [
            'profile' => $profile ? [
                'age' => $profile->age,
                'weight' => $profile->weight,
                'height' => $profile->height,
                'gender' => $profile->gender,
            ] : null,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update nutrition profile.
     */
    public function update(NutritionProfileUpdateRequest $request): RedirectResponse
    {
        NutritionProfile::updateOrCreateForUser(Auth::id(), $request->validated());

        return to_route('nutrition-profile.edit')->with('status', 'saved');
    }
}