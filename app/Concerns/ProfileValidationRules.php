<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId),
            'age' => $this->ageRules(),
            'weight' => $this->weightRules(),
            'height' => $this->heightRules(),
            'gender' => $this->genderRules(),
        ];
    }

    /**
     * Get the validation rules used to validate user age.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function ageRules(): array
    {
        return ['nullable', 'integer', 'min:1', 'max:120'];
    }

    /**
     * Get the validation rules used to validate user weight.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function weightRules(): array
    {
        return ['nullable', 'numeric', 'min:20', 'max:300'];
    }

    /**
     * Get the validation rules used to validate user height.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function heightRules(): array
    {
        return ['nullable', 'numeric', 'min:100', 'max:250'];
    }

    /**
     * Get the validation rules used to validate user gender.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function genderRules(): array
    {
        return ['nullable', 'in:male,female'];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
