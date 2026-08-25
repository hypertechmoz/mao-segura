import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PROFESSION_CATEGORIES, JOBS_CATEGORIES_MAP, JOB_TYPES } from '../constants';

export function useTaxonomy() {
    const [categories, setCategories] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTaxonomy = async () => {
            try {
                setLoading(true);
                
                // Fetch categories
                const { data: catsData, error: catsError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');
                
                if (catsError) throw catsError;
                
                // Fetch specialties
                const { data: specData, error: specError } = await supabase
                    .from('specialties')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');
                    
                if (specError) throw specError;

                if (catsData && catsData.length > 0) {
                    setCategories(catsData);
                    setSpecialties(specData || []);
                } else {
                    // Fallback to local constants if DB is empty or migration not applied
                    useFallback();
                }

            } catch (err) {
                console.warn('Error fetching taxonomy, using local constants fallback:', err.message);
                useFallback();
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const useFallback = () => {
            const fallbackCategories = PROFESSION_CATEGORIES.map((name, index) => ({
                id: `fallback-cat-${index}`,
                name: name,
            }));
            
            const fallbackSpecialties = [];
            Object.entries(JOBS_CATEGORIES_MAP).forEach(([catName, specs], catIndex) => {
                const catId = `fallback-cat-${catIndex}`;
                specs.forEach((specName, specIndex) => {
                    fallbackSpecialties.push({
                        id: `fallback-spec-${catIndex}-${specIndex}`,
                        category_id: catId,
                        name: specName,
                        category_name: catName, // Helper
                    });
                });
            });

            setCategories(fallbackCategories);
            setSpecialties(fallbackSpecialties);
        };

        fetchTaxonomy();
    }, []);

    const getSpecialtiesByCategory = (categoryId) => {
        return specialties.filter(s => s.category_id === categoryId);
    };
    
    const getSpecialtiesByCategoryName = (categoryName) => {
        const cat = categories.find(c => c.name === categoryName);
        if (!cat) return [];
        return getSpecialtiesByCategory(cat.id);
    };

    // Helper formats for dropdowns/selects
    const categoryOptions = categories.map(c => ({ label: c.name, value: c.name }));
    const specialtyOptions = specialties.map(s => ({ label: s.name, value: s.name }));

    return {
        categories,
        specialties,
        categoryOptions,
        specialtyOptions,
        loading,
        error,
        getSpecialtiesByCategory,
        getSpecialtiesByCategoryName
    };
}
